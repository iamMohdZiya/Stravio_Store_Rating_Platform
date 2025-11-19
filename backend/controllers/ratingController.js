// /controllers/ratingController.js

const Joi = require('joi');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { ratingSchema } = require('../utils/validation');

// @route   POST /api/ratings
// @desc    Normal User: Submit a new rating for a store
// @access  Private/USER
exports.submitRating = async (req, res) => {
    // 1. Validate input against Joi schema
    const { error, value } = ratingSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { storeId, rating } = value;
    const userId = req.userId;

    try {
        // 2. Check if the store exists
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ message: 'Store not found.' });
        }
        
        // 3. Check if user has already rated this store
        const existingRating = await Rating.findOne({ userId, storeId });
        if (existingRating) {
            return res.status(400).json({ 
                message: 'You have already rated this store. Use the PUT endpoint to modify your rating.' 
            });
        }

        // 4. Create and save the new rating
        const newRating = await Rating.create({ userId, storeId, rating });

        res.status(201).json({
            message: 'Rating submitted successfully.',
            ratingId: newRating._id,
            rating: newRating.rating
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/ratings/:storeId
// @desc    Normal User: Modify their existing rating for a store
// @access  Private/USER
exports.modifyRating = async (req, res) => {
    // 1. Validate input (only rating value needs validation here)
    const { rating } = req.body;
    
    const ratingValueSchema = Joi.number().integer().min(1).max(5).required();
    const { error } = ratingValueSchema.validate(rating);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    const storeId = req.params.storeId;
    const userId = req.userId;

    try {
        // 2. Find the existing rating by user and store ID
        const existingRating = await Rating.findOne({ userId, storeId });

        if (!existingRating) {
            return res.status(404).json({ 
                message: 'No existing rating found to modify. Use the POST endpoint to submit a new rating.' 
            });
        }

        // 3. Update the rating value and save
        existingRating.rating = rating;
        await existingRating.save();

        res.json({
            message: 'Rating modified successfully.',
            ratingId: existingRating._id,
            newRating: existingRating.rating
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};