// /middleware/roleCheck.js

/**
 * Middleware to check if the user's role is included in the allowedRoles array.
 * @param {Array<string>} allowedRoles - An array of roles that are permitted access (e.g., ['ADMIN', 'OWNER'])
 */
exports.authorize = (allowedRoles) => (req, res, next) => {
    // Check if the role attached by the authentication middleware is in the list of allowed roles
    if (!allowedRoles.includes(req.role)) {
        // 403 Forbidden status code
        return res.status(403).json({ 
            message: `Access denied. Role ${req.role} does not have permission.` 
        });
    }

    next(); // Role is authorized, proceed
};