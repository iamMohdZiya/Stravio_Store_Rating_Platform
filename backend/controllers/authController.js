// /controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userSchema, loginSchema } = require('../utils/validation');

/**
 * Helper function to generate a JWT token
 * @param {string} id - User ID
 * @param {string} role - User Role
 */
const generateToken = (id, role) => {
    return jwt.sign({ userId: id, role: role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// @route   POST /api/auth/signup
// @desc    Register a new Normal User
// @access  Public
exports.signup = async (req, res) => {
    // 1. Validate input against Joi schema
    const { error, value } = userSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, address } = value;

    try {
        // 2. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        // 3. Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 4. Create and save the new User (default role is 'USER')
        user = await User.create({
            name,
            email,
            password_hash,
            address,
            role: 'USER' // Normal User signup
        });

        // 5. Generate Token
        const token = generateToken(user._id, user.role);

        // 6. Respond (only return safe data)
        res.status(201).json({
            token,
            userId: user._id,
            role: user.role,
            message: 'User registered successfully.'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
    // 1. Validate input against Joi schema
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    try {
        // 2. Find user by email, explicitly selecting the password hash
        const user = await User.findOne({ email }).select('+password_hash');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid Credentials.' });
        }

        // 3. Compare submitted password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials.' });
        }

        // 4. Generate Token
        const token = generateToken(user._id, user.role);

        // 5. Respond
        res.json({
            token,
            userId: user._id,
            role: user.role,
            message: 'Login successful.'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/auth/password
// @desc    Update logged-in user's password
// @access  Private (All Roles)
exports.updatePassword = async (req, res) => {
    // We assume validation for the new password happens on the frontend,
    // but the backend must enforce the password complexity rule.
    const { password } = req.body;
    
    // Quick validation check for new password using the reusable password schema
    const passwordCheckSchema = Joi.object({ password: passwordSchema });
    const { error } = passwordCheckSchema.validate({ password });
    
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    try {
        // Find user by ID attached by the authentication middleware
        const user = await User.findById(req.userId).select('+password_hash');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(password, salt);

        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};