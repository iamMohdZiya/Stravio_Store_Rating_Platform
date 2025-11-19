// /routes/auth.js

const express = require('express');
const router = express.Router();
const { signup, login, updatePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/signup', signup); // Normal User registration
router.post('/login', login);   // All users log in here

// Protected route for password update
router.put('/password', authenticate, updatePassword);

module.exports = router;