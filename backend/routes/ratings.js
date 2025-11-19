// /routes/ratings.js

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// Middleware to ensure only authenticated Normal Users can access these routes
router.use(authenticate, authorize(['USER'])); 

// @route   POST /api/ratings
// @desc    Normal User: Submit a new rating for a store
// @access  Private/USER
router.post('/', ratingController.submitRating);

// @route   PUT /api/ratings/:storeId
// @desc    Normal User: Modify their existing rating for a store
// @access  Private/USER
router.put('/:storeId', ratingController.modifyRating);

module.exports = router;