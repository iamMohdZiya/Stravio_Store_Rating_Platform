// /middleware/auth.js

const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate the user using JWT from the 'x-auth-token' header.
 * Attaches req.userId and req.role to the request object.
 */
exports.authenticate = (req, res, next) => {
    // 1. Get token from header
    const token = req.header('x-auth-token');

    // 2. Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied.' });
    }

    try {
        // 3. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user data to the request object
        req.userId = decoded.userId;
        req.role = decoded.role;

        next(); // Proceed to the next middleware/controller
    } catch (err) {
        // Token is not valid (e.g., expired or malformed)
        res.status(401).json({ message: 'Token is not valid.' });
    }
};