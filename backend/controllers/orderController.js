/**
 * Order Controller
 * Handles order creation and management
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const { writeReceipt, readReceipt, receiptExists } = require('../utils/receiptStore');
const logger = require('../utils/logger');
const { writeAdminAudit } = require('../utils/adminAudit');

function buildReceiptPayload(order, user) {
  const plain = order?.toObject ? order.toObject({ virtuals: false }) : order;
  return {
    kind: 'redstore-receipt',
    version: 1,
    orderId: plain?._id,
    user: {
      id: user?.id,
      username: user?.username,
      role: user?.role,
    },
    createdAt: plain?.createdAt,
    updatedAt: plain?.updatedAt,
    status: plain?.status,
    paymentMethod: plain?.paymentMethod,
    totalAmount: plain?.totalAmount,
    shippingAddress: plain?.shippingAddress || null,
    items: (plain?.items || []).map(it => ({
      product: it?.product?._id || it?.product || null,
      name: it?.product?.name || it?.name || null,
      quantity: it?.quantity,
      price: it?.price,
    })),
  };
}

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

    logger.info('📦 Creating order with items:', items);
    
    // Validate stock
    for (const item of items) {
      logger.info(`Checking stock for product ${item.product}`);
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
        });
      }
    }
    
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    // Populate product info for a richer receipt archive
    const populatedOrder = await Order.findById(order._id).populate('items.product');
    
    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }
    
  logger.info('✅ Order created successfully:', order._id);

    // Best-effort: archive a receipt JSON to Appdev/Receipts
    try {
      const receipt = buildReceiptPayload(populatedOrder || order, req.user);
      await writeReceipt(order._id, receipt);
      logger.info('🧾 Receipt archived for order:', order._id);
    } catch (e) {
      logger.warn('⚠️ Failed to archive receipt:', e.message);
    }
    
    res.status(201).json({
      success: true,
      data: populatedOrder || order,
    });
  } catch (error) {
    logger.error('❌ Error creating order:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Archive (or re-archive) a receipt file for an order
exports.archiveReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate('items.product');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to archive this order' });
    }

    const receipt = buildReceiptPayload(order, req.user);
    await writeReceipt(id, receipt);

    return res.status(200).json({ success: true, data: { orderId: id } });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get archived receipt by order id (must own the order or be admin)
exports.getArchivedReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).select('user');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this receipt' });
    }

    const exists = await receiptExists(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: 'Receipt not archived' });
    }

    const receipt = await readReceipt(id);
    return res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get order by ID
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.product');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    
    // Check if order belongs to user
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order',
      });
    }
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    await writeAdminAudit(req, {
      action: 'order.status.update',
      targetType: 'order',
      targetId: order?._id || id,
      status: 'success',
      meta: { status },
    });
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    await writeAdminAudit(req, {
      action: 'order.status.update',
      targetType: 'order',
      targetId: req?.params?.id,
      status: 'failure',
      message: error.message,
      meta: { status: req?.body?.status },
    });
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'username email')
      .populate('items.product')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
