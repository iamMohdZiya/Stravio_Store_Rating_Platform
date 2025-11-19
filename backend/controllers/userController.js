// /controllers/userController.js

const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const bcrypt = require('bcryptjs');
const { userSchema } = require('../utils/validation');

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
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // 3. Hash password
        const password_hash = await hashPassword(password);

        // 4. Create user
        user = await User.create({
            name,
            email,
            password_hash,
            address,
            role: role // Admin can define the role
        });

        // 5. Respond with clean user data
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            message: `${role} created successfully.`
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/users
// @desc    Admin: View list of all users with filters/sorting
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        // Extract query parameters for filtering and sorting
        const { name, email, address, role, sortBy, sortOrder = 'asc' } = req.query;
        
        // Build Filter object
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' }; // Case-insensitive partial match
        if (email) filter.email = email;
        if (address) filter.address = { $regex: address, $options: 'i' };
        if (role) filter.role = role;

        // Build Sort object
        const sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default sort
            sort.createdAt = -1;
        }

        const users = await User.find(filter)
            .sort(sort)
            .select('-password_hash'); // Exclude hash

        res.json({ count: users.length, users });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// @route   GET /api/users/:id
// @desc    Admin: View details of a specific user (includes Owner's rating info)
// @access  Private/Admin
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Find the user
        const user = await User.findById(userId).select('-password_hash');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        let userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role
        };

        // 2. If user is a Store Owner, fetch their store's average rating
        if (user.role === 'OWNER') {
            // Find the store owned by this user
            const store = await Store.findOne({ ownerId: userId });
            
            if (store) {
                // Calculate average rating using MongoDB aggregation
                const result = await Rating.aggregate([
                    { $match: { storeId: store._id } },
                    { $group: { 
                        _id: null, 
                        averageRating: { $avg: "$rating" } 
                    }}
                ]);
                
                const averageRating = result.length > 0 ? parseFloat(result[0].averageRating).toFixed(2) : 'N/A';
                
                userData.storeDetails = {
                    storeName: store.name,
                    storeId: store._id,
                    averageRating: averageRating
                };
            }
        }

        res.json(userData);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};











// @route   GET /api/users/metrics
// @desc    Admin: Get total user, store, and rating counts
// @access  Private/Admin
exports.getSystemMetrics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStores = await Store.countDocuments();
        const totalRatings = await Rating.countDocuments();

        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};