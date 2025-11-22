// /controllers/userController.js

const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const bcrypt = require('bcryptjs');
const { userSchema } = require('../utils/validation');
const { Op } = require('sequelize');

// Helper to hash password (reused from authController, better placed in a utility)
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// @route   POST /api/users
// @desc    Admin: Create a new user (ADMIN, USER, or OWNER)
// @access  Private/Admin
exports.createUser = async (req, res) => {
    // 1. Validate input (must include 'role' from the admin form)
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, address, role } = value;

    try {
        // 2. Check for email uniqueness
        const existingUser = await User.findOne({ 
            where: { email: email.toLowerCase() } 
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // 3. Hash password
        const password_hash = await hashPassword(password);

        // 4. Create user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password_hash,
            address,
            role: role // Admin can define the role
        });

        // 5. Respond with clean user data
        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: `${role} created successfully.`
        });

    } catch (err) {
        console.error('Create user error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route   GET /api/users
// @desc    Admin: View list of all users with filters/sorting
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        // Extract query parameters for filtering and sorting
        const { name, email, address, role, sortBy, sortOrder = 'asc' } = req.query;
        
        // Build Filter object (where clause)
        const where = {};
        if (name) where.name = { [Op.like]: `%${name}%` }; // Case-insensitive partial match
        if (email) where.email = email.toLowerCase();
        if (address) where.address = { [Op.like]: `%${address}%` };
        if (role) where.role = role;

        // Build Sort array
        const order = [];
        if (sortBy) {
            order.push([sortBy, sortOrder.toUpperCase()]);
        } else {
            // Default sort
            order.push(['createdAt', 'DESC']);
        }

        const users = await User.findAll({
            where,
            order,
            attributes: { exclude: ['password_hash'] } // Exclude hash
        });

        res.json({ count: users.length, users });

    } catch (err) {
        console.error('Get users error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @route   GET /api/users/:id
// @desc    Admin: View details of a specific user (includes Owner's rating info)
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // 1. Find the user
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password_hash'] }
        });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role
        };

        // 2. If user is a Store Owner, fetch their store's average rating
        if (user.role === 'OWNER') {
            // Find the store owned by this user
            const store = await Store.findOne({ 
                where: { ownerId: userId } 
            });
            
            if (store) {
                // Calculate average rating using Sequelize aggregation
                const ratings = await Rating.findAll({
                    where: { storeId: store.id },
                    attributes: ['rating']
                });
                
                const averageRating = ratings.length > 0 
                    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2)
                    : 'N/A';
                
                userData.storeDetails = {
                    storeName: store.name,
                    storeId: store.id,
                    averageRating: averageRating
                };
            }
        }

        res.json(userData);

    } catch (err) {
        console.error('Get user details error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route   GET /api/users/metrics
// @desc    Admin: Get total user, store, and rating counts
// @access  Private/Admin
exports.getSystemMetrics = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalStores = await Store.count();
        const totalRatings = await Rating.count();

        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });
    } catch (err) {
        console.error('Get metrics error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
