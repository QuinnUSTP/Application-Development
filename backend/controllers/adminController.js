/**
 * Admin Controller
 * Small operational endpoints for the admin dashboard (metrics/health etc.)
 */

const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// GET /api/admin/metrics (admin only)
exports.getMetrics = async (req, res) => {
  try {
    // Keep this lightweight (fast counts only)
    const [
      productsTotal,
      productsLowStock,
      ordersTotal,
      ordersPending,
      usersTotal,
      usersAdmins,
    ] = await Promise.all([
      Product.countDocuments({}),
      Product.countDocuments({ stock: { $lte: 5 } }),
      Order.countDocuments({}),
      Order.countDocuments({ status: 'pending' }),
      User.countDocuments({}),
      User.countDocuments({ role: 'admin' }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        products: {
          total: productsTotal,
          lowStock: productsLowStock,
          lowStockThreshold: 5,
        },
        orders: {
          total: ordersTotal,
          pending: ordersPending,
        },
        users: {
          total: usersTotal,
          admins: usersAdmins,
        },
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
