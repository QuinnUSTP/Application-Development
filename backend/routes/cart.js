/**
 * Cart Routes
 */

const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { getMyCart, setCartItem, clearMyCart } = require('../controllers/cartController');

router.get('/', protect, getMyCart);
router.post('/item', protect, setCartItem);
router.post('/clear', protect, clearMyCart);

module.exports = router;
