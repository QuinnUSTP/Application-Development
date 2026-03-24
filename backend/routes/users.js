/**
 * User Routes
 * API endpoints for user authentication and management
 */

const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getAllUsers,
  promoteToAdmin,
  changePassword,
  getUserAddress,
  saveUserAddress,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/profile', protect, getUserProfile);
router.post('/change-password', protect, changePassword);

// User address routes
router.get('/address', protect, getUserAddress);
router.post('/address', protect, saveUserAddress);

// Admin routes
router.get('/list', protect, authorize('admin'), getAllUsers);
router.put('/:id/promote', protect, authorize('admin'), promoteToAdmin);

module.exports = router;
