/**
 * Admin Routes
 * Operational endpoints for the admin dashboard.
 */

const express = require('express');
const router = express.Router();

const { getMetrics } = require('../controllers/adminController');
const { listActivity } = require('../controllers/adminActivityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/metrics', protect, authorize('admin'), getMetrics);
router.get('/activity', protect, authorize('admin'), listActivity);

module.exports = router;
