// /controllers/storeController.js

const Store = require('../models/Store');
const User = require('../models/User');
const Rating = require('../models/Rating');
const { storeSchema } = require('../utils/validation');
const mongoose = require('mongoose');

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

    // 2. Additional check: Ensure ownerId belongs to a user with role 'OWNER'
    try {
        const owner = await User.findById(ownerId);
        if (!owner || owner.role !== 'OWNER') {
            return res.status(400).json({ 
                message: 'Invalid ownerId or user is not a Store Owner.' 
            });
        }
        
        // 3. Check for uniqueness constraints (name, email)
        if (await Store.findOne({ name })) {
            return res.status(400).json({ message: 'Store name already exists.' });
        }
        if (await Store.findOne({ email })) {
            return res.status(400).json({ message: 'Store email already exists.' });
        }
        if (await Store.findOne({ ownerId })) {
            return res.status(400).json({ message: 'Owner is already assigned to a store.' });
        }

        // 4. Create and save the new Store
        const store = await Store.create({ name, email, address, ownerId });

        res.status(201).json({
            id: store._id,
            name: store.name,
            address: store.address,
            ownerId: store.ownerId,
            message: 'Store created successfully.'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
        const filter = {};
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (address) filter.address = { $regex: address, $options: 'i' };

        // 2. MongoDB Aggregation Pipeline
        const pipeline = [
            // Stage 1: Filter stores based on query parameters
            { $match: filter },
            
            // Stage 2: Calculate Average Rating
            {
                $lookup: {
                    from: 'ratings', // The name of the collection (usually lowercase and plural)
                    localField: '_id',
                    foreignField: 'storeId',
                    as: 'all_ratings'
                }
            },
            {
                $addFields: {
                    averageRating: { $avg: '$all_ratings.rating' },
                    // Project only the current user's rating for display
                    currentUserRating: {
                        $filter: {
                            input: '$all_ratings',
                            as: 'rating',
                            cond: { $eq: ['$$rating.userId', new mongoose.Types.ObjectId(currentUserId)] }
                        }
                    }
                }
            },
            
            // Stage 3: Project the final output shape
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    address: 1,
                    overallRating: { 
                        // Format to 2 decimal places or null
                        $cond: {
                            if: { $ne: ['$averageRating', null] },
                            then: { $round: ['$averageRating', 2] },
                            else: null
                        }
                    },
                    userSubmittedRating: { 
                        // Extract the rating value if it exists, otherwise null
                        $arrayElemAt: ['$currentUserRating.rating', 0]
                    },
                    createdAt: 1
                }
            }
        ];
        
        // 3. Sorting
        const sort = {};
        if (sortBy) {
             // 'overallRating' is a projected field, others are direct fields
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort.createdAt = -1;
        }

        pipeline.push({ $sort: sort });


        const stores = await Store.aggregate(pipeline);

        res.json({ count: stores.length, stores });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/stores/:id
// @desc    All: View single store details
// @access  Private (All Roles)
exports.getStoreDetails = async (req, res) => {
    // This endpoint could reuse the aggregation logic above but only match on the specific _id
    // For brevity, we'll keep it simple:

    try {
        const storeId = req.params.id;
        const store = await Store.findById(storeId);

        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }

        // Calculate average rating for this specific store
        const result = await Rating.aggregate([
            { $match: { storeId: store._id } },
            { $group: { 
                _id: null, 
                averageRating: { $avg: "$rating" } 
            }}
        ]);
        
        const overallRating = result.length > 0 ? parseFloat(result[0].averageRating).toFixed(2) : 'N/A';

        // Get current user's submitted rating
        let userSubmittedRating = null;
        if (req.userId) {
            const userRating = await Rating.findOne({ 
                userId: req.userId, 
                storeId: store._id 
            });
            if (userRating) {
                userSubmittedRating = userRating.rating;
            }
        }

        res.json({
            id: store._id,
            name: store.name,
            email: store.email,
            address: store.address,
            overallRating,
            userSubmittedRating
        });
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};