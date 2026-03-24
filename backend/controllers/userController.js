/**
 * User Controller
 * Handles user authentication and management
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { writeAdminAudit } = require('../utils/adminAudit');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: '30d',
  });
};

function setAuthCookie(res, token) {
  // httpOnly cookie prevents JS access (mitigates XSS + avoids localStorage desync)
  // Note: secure should be true when served over HTTPS.
  res.cookie('auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true',
    path: '/',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  const options = {
    httpOnly: true,
    sameSite: 'lax',
    secure: String(process.env.COOKIE_SECURE || '').toLowerCase() === 'true',
    path: '/',
  };

  // Two-step clear improves cross-browser behavior.
  res.clearCookie('auth_token', options);
  res.cookie('auth_token', '', { ...options, expires: new Date(0) });
}

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }
    
    // Create user
    user = await User.create({
      username,
      email,
      password,
    });
    
    const token = generateToken(user._id);

    setAuthCookie(res, token);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password',
      });
    }
    
    // Check for user
    const user = await User.findOne({ username }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    const token = generateToken(user._id);

    setAuthCookie(res, token);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Logout (client can call this to clear cookie)
exports.logoutUser = async (req, res) => {
  try {
    clearAuthCookie(res);
    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Promote user to admin (admin only)
exports.promoteToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { role: 'admin' },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await writeAdminAudit(req, {
      action: 'user.promote',
      targetType: 'user',
      targetId: user?._id || id,
      targetName: user?.username,
      status: 'success',
    });
    
    res.status(200).json({
      success: true,
      message: 'User promoted to admin',
      data: user,
    });
  } catch (error) {
    await writeAdminAudit(req, {
      action: 'user.promote',
      targetType: 'user',
      targetId: req?.params?.id,
      status: 'failure',
      message: error.message,
    });
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user shipping address
exports.getUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('shippingAddress');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.shippingAddress || null,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Save/update user shipping address
exports.saveUserAddress = async (req, res) => {
  try {
    const { name, street, city, state, zip, country } = req.body || {};

    if (!name || !street || !city || !state || !zip || !country) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, street, city, state, zip, and country',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.shippingAddress = { name, street, city, state, zip, country };
    await user.save();

    res.status(200).json({
      success: true,
      data: user.shippingAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
