// /routes/owner.js

const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/ownerController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Middleware to ensure only authenticated Store Owners can access these routes
router.use(authenticate, authorize(['OWNER'])); 

// @route   GET /api/owner/dashboard
// @desc    Store Owner: View dashboard data (average rating, user ratings list)
// @access  Private/OWNER
router.get('/dashboard', ownerController.getOwnerDashboard);

module.exports = router;