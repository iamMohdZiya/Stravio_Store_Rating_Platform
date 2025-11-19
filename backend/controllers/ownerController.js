// /controllers/ownerController.js

const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   GET /api/owner/dashboard
// @desc    Store Owner: View dashboard data (average rating, user ratings list)
// @access  Private/OWNER
exports.getOwnerDashboard = async (req, res) => {
    const ownerId = req.userId; // ID of the logged-in Store Owner

    try {
        // 1. Find the store owned by the current user
        const store = await Store.findOne({ ownerId });

        if (!store) {
            return res.status(404).json({ 
                message: 'No store found associated with this user ID.' 
            });
        }

        const storeId = store._id;

        // 2. MongoDB Aggregation to get Average Rating and Ratings List with User Info
        const dashboardData = await Rating.aggregate([
            // Stage 1: Filter ratings belonging to the owner's store
            { $match: { storeId: storeId } },

            // Stage 2: Lookup the user details for each rating
            {
                $lookup: {
                    from: 'users', // Name of the User collection
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user_info'
                }
            },

            // Stage 3: Unwind user_info array (since userId is unique, this is safe)
            { $unwind: '$user_info' },

            // Stage 4: Group all results to calculate the average rating
            {
                $group: {
                    _id: '$storeId',
                    averageRating: { $avg: '$rating' },
                    ratingsList: { // Create an array of rating details
                        $push: {
                            ratingId: '$_id',
                            rating: '$rating',
                            submittedAt: '$createdAt',
                            userName: '$user_info.name',
                            userEmail: '$user_info.email'
                        }
                    }
                }
            },
            
            // Stage 5: Project final data structure
            {
                $project: {
                    _id: 0,
                    averageRating: { $round: ['$averageRating', 2] }, // Round to 2 decimals
                    ratingsList: 1
                }
            }
        ]);

        // 3. Handle cases where there are no ratings yet
        const result = dashboardData[0] || { averageRating: 0.00, ratingsList: [] };

        res.json({
            storeId: store._id,
            storeName: store.name,
            averageRating: result.averageRating,
            usersWhoRated: result.ratingsList
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};