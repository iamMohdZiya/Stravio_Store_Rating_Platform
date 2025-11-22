// /controllers/ownerController.js

const Store = require('../models/Store');
const Rating = require('../models/Rating');
const User = require('../models/User');
const { Op } = require('sequelize');

// @route   GET /api/owner/dashboard
// @desc    Store Owner: View dashboard data (average rating, user ratings list)
// @access  Private/OWNER
exports.getOwnerDashboard = async (req, res) => {
    const ownerId = req.userId; // ID of the logged-in Store Owner

    try {
        // 1. Find the store owned by the current user
        const store = await Store.findOne({ where: { ownerId } });

        if (!store) {
            return res.status(404).json({ 
                message: 'No store found associated with this user ID.' 
            });
        }

        const storeId = store.id;

        // 2. Get all ratings for this store with user information
        const ratings = await Rating.findAll({
            where: { storeId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // 3. Calculate average rating
        let averageRating = 0;
        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            averageRating = parseFloat((sum / ratings.length).toFixed(2));
        }

        // 4. Format ratings list
        const usersWhoRated = ratings.map(rating => ({
            ratingId: rating.id,
            rating: rating.rating,
            submittedAt: rating.createdAt,
            userName: rating.user ? rating.user.name : 'Unknown',
            userEmail: rating.user ? rating.user.email : 'Unknown'
        }));

        res.json({
            storeId: store.id,
            storeName: store.name,
            averageRating: averageRating || 0,
            usersWhoRated: usersWhoRated
        });

    } catch (err) {
        console.error('Get owner dashboard error:', err.message);
        res.status(500).json({ message: 'Server Error' });
    }
};
