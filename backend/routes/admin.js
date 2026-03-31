/**
 * Admin Routes
 * Operational endpoints for the admin dashboard.
 */

const express = require('express');
const router = express.Router();

const { getMetrics, getSchema } = require('../controllers/adminController');
const { listActivity } = require('../controllers/adminActivityController');
const { protect, authorize } = require('../middleware/auth');

router.get('/metrics', protect, authorize('admin'), getMetrics);
router.get('/schema', protect, authorize('admin'), getSchema);
router.get('/activity', protect, authorize('admin'), listActivity);

module.exports = router;
