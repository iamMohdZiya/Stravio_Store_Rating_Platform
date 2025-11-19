const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        minlength: [20, 'Name must be at least 20 characters'],
        maxlength: [60, 'Name cannot exceed 60 characters'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        // Standard email validation (more comprehensive regex can be used in controller/utils)
        match: [/.+@.+\..+/, 'Please enter a valid email address'], 
        lowercase: true,
        trim: true
    },
    password_hash: { // Storing the hashed password
        type: String,
        required: [true, 'Password is required'],
        select: false // IMPORTANT: Do not return the hash by default in queries
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        maxlength: [400, 'Address cannot exceed 400 characters'],
        trim: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'USER', 'OWNER'], // The three defined roles
        default: 'USER', // Default role for signup is Normal User
        required: true
    }
}, { timestamps: true }); // Mongoose adds createdAt and updatedAt fields

module.exports = mongoose.model('User', UserSchema);