// /controllers/storeController.js

const Store = require('../models/Store');
const User = require('../models/User');
const Rating = require('../models/Rating');
const { storeSchema } = require('../utils/validation');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @route   POST /api/stores
// @desc    Admin: Create a new store
// @access  Private/Admin
exports.createStore = async (req, res) => {
    // 1. Validate input against Joi schema
    const { error, value } = storeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    const { name, email, address, ownerId } = value;
    const ownerIdInt = parseInt(ownerId);

    // 2. Additional check: Ensure ownerId belongs to a user with role 'OWNER'
    try {
        const owner = await User.findByPk(ownerIdInt);
        if (!owner || owner.role !== 'OWNER') {
            return res.status(400).json({ 
                message: 'Invalid ownerId or user is not a Store Owner.' 
            });
        }
        
        // 3. Check for uniqueness constraints (name, email, ownerId)
        const existingName = await Store.findOne({ where: { name } });
        if (existingName) {
            return res.status(400).json({ message: 'Store name already exists.' });
        }
        const existingEmail = await Store.findOne({ where: { email: email.toLowerCase() } });
        if (existingEmail) {
            return res.status(400).json({ message: 'Store email already exists.' });
        }
        const existingOwner = await Store.findOne({ where: { ownerId: ownerIdInt } });
        if (existingOwner) {
            return res.status(400).json({ message: 'Owner is already assigned to a store.' });
        }

        // 4. Create and save the new Store
        const store = await Store.create({ 
            name, 
            email: email.toLowerCase(), 
            address, 
            ownerId: ownerIdInt 
        });

        res.status(201).json({
            id: store.id,
            name: store.name,
            address: store.address,
            ownerId: store.ownerId,
            message: 'Store created successfully.'
        });

    } catch (err) {
        console.error('Create store error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route   GET /api/stores
// @desc    All: View list of all stores with search/filter/sort/rating
// @access  Private (All Roles)
exports.getStores = async (req, res) => {
    try {
        const { name, address, sortBy, sortOrder = 'desc' } = req.query;
        const currentUserId = req.userId; // User ID from the JWT token

        // 1. Build Search Filter
        const where = {};
        if (name) where.name = { [Op.like]: `%${name}%` };
        if (address) where.address = { [Op.like]: `%${address}%` };

        // 2. Get all stores
        const stores = await Store.findAll({ where });
        
        // Get all ratings for these stores
        const storeIds = stores.map(s => s.id);
        const ratings = storeIds.length > 0
            ? await Rating.findAll({
                where: { storeId: { [Op.in]: storeIds } },
                attributes: ['id', 'rating', 'userId', 'storeId']
            })
            : [];

        // 3. Process results to calculate ratings and format
        const formattedStores = stores.map(store => {
            const storeData = store.toJSON();
            const storeRatings = ratings.filter(r => r.storeId === store.id);
            
            // Calculate overall rating
            let overallRating = null;
            if (storeRatings.length > 0) {
                const sum = storeRatings.reduce((acc, r) => acc + r.rating, 0);
                overallRating = parseFloat((sum / storeRatings.length).toFixed(2));
            }
            
            // Find user's rating
            let userSubmittedRating = null;
            const userRating = storeRatings.find(r => r.userId === currentUserId);
            if (userRating) {
                userSubmittedRating = userRating.rating;
            }
            
            return {
                _id: storeData.id,
                id: storeData.id,
                name: storeData.name,
                email: storeData.email,
                address: storeData.address,
                overallRating: overallRating,
                userSubmittedRating: userSubmittedRating,
                createdAt: storeData.createdAt
            };
        });

        // 4. Sorting
        if (sortBy) {
            formattedStores.sort((a, b) => {
                let aVal = a[sortBy];
                let bVal = b[sortBy];
                
                // Handle null values
                if (aVal === null || aVal === undefined) aVal = sortOrder === 'desc' ? -Infinity : Infinity;
                if (bVal === null || bVal === undefined) bVal = sortOrder === 'desc' ? -Infinity : Infinity;
                
                // Convert to numbers if they're rating values
                if (sortBy === 'overallRating' || sortBy === 'userSubmittedRating') {
                    aVal = parseFloat(aVal) || 0;
                    bVal = parseFloat(bVal) || 0;
                }
                
                if (sortOrder === 'desc') {
                    return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
                } else {
                    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                }
            });
        } else {
            // Default sort by createdAt desc
            formattedStores.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        res.json({ count: formattedStores.length, stores: formattedStores });

    } catch (err) {
        console.error('Get stores error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @route   GET /api/stores/:id
// @desc    All: View single store details
// @access  Private (All Roles)
exports.getStoreDetails = async (req, res) => {
    try {
        const storeId = parseInt(req.params.id);
        const store = await Store.findByPk(storeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Calculate average rating for this specific store
        const ratings = await Rating.findAll({
            where: { storeId: store.id },
            attributes: ['rating']
        });
        
        const overallRating = ratings.length > 0 
            ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(2))
            : null;

        // Get current user's submitted rating
        let userSubmittedRating = null;
        if (req.userId) {
            const userRating = await Rating.findOne({ 
                where: { 
                    userId: req.userId, 
                    storeId: store.id 
                } 
            });
            if (userRating) {
                userSubmittedRating = userRating.rating;
            }
        }

        res.json({
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            overallRating,
            userSubmittedRating
        });
        
    } catch (err) {
        console.error('Get store details error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
