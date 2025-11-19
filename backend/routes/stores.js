// /routes/stores.js

const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// --- Admin-Only Routes ---

// @route   POST /api/stores
// @desc    Admin: Create a new store
// @access  Private/Admin
router.post('/', authenticate, authorize(['ADMIN']), storeController.createStore);


// --- All Authenticated User Routes ---

// @route   GET /api/stores
// @desc    All: View list of all stores with search/filter/sort
// @access  Private (All Roles)
router.get('/', authenticate, storeController.getStores);

// @route   GET /api/stores/:id
// @desc    All: View single store details
// @access  Private (All Roles)
router.get('/:id', authenticate, storeController.getStoreDetails);


module.exports = router;