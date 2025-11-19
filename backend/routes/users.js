// /routes/users.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes here require authentication and Admin role
router.use(authenticate, authorize(['ADMIN'])); 

// @route   GET /api/users/metrics
// @desc    Admin: Get system wide metrics
// @access  Private/Admin
router.get('/metrics', userController.getSystemMetrics);

// @route   POST /api/users
// @desc    Admin: Create a new user (Admin, User, or Owner)
// @access  Private/Admin
router.post('/', userController.createUser);

// @route   GET /api/users
// @desc    Admin: View list of all users with filters/sorting
// @access  Private/Admin
router.get('/', userController.getUsers);

// @route   GET /api/users/:id
// @desc    Admin: View details of a specific user (including Owner's rating info)
// @access  Private/Admin
router.get('/:id', userController.getUserDetails);

module.exports = router;