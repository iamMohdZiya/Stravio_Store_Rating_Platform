const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema({
    // Reference to the Normal User who submitted the rating
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Reference to the Store being rated
    storeId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Store',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Rating value is required'],
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5']
    }
}, { timestamps: true });

// Enforce that a single user can only submit one rating per store (Composite Unique Index)
RatingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', RatingSchema);