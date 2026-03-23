/**
 * Order Routes
 * API endpoints for order management
 */

const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  archiveReceipt,
  getArchivedReceipt,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/', protect, getUserOrders);
router.get('/all', protect, authorize('admin'), getAllOrders);
router.get('/:id/receipt', protect, getArchivedReceipt);
router.post('/:id/receipt/archive', protect, archiveReceipt);
router.get('/:id', protect, getOrder);
router.put('/:id', protect, authorize('admin'), updateOrderStatus);

module.exports = router;
