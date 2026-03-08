/**
 * User Routes
 * API endpoints for user authentication and management
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  getAllUsers,
  promoteToAdmin,
  changePassword,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/change-password', protect, changePassword);

// Admin routes
router.get('/list', protect, authorize('admin'), getAllUsers);
router.put('/:id/promote', protect, authorize('admin'), promoteToAdmin);

module.exports = router;
