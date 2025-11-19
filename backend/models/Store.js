const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Store name is required'],
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Store email is required'],
        unique: true,
        match: [/.+@.+\..+/, 'Please enter a valid store email address'],
        lowercase: true,
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Store address is required'],
        maxlength: [400, 'Address cannot exceed 400 characters'],
        trim: true
    },
    // Reference to the User who is the Store Owner (role: 'OWNER')
    ownerId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Store owner is required'],
        unique: true // A user can only own one store in this simple schema
    },
    // Virtual field for average rating (calculated in controller or using MongoDB aggregation)
    averageRating: {
        type: Number,
        default: 0
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true } // Include virtuals when converting to JS object
});

// We can add a virtual property to get all ratings for a store, though aggregation is better for average
StoreSchema.virtual('ratings', {
    ref: 'Rating',
    localField: '_id',
    foreignField: 'storeId',
    justOne: false
});

module.exports = mongoose.model('Store', StoreSchema);