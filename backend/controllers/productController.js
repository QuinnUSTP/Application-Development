/**
 * Product Controller
 * Handles all product-related business logic
 */

const Product = require('../models/Product');
const { writeAdminAudit } = require('../utils/adminAudit');

// Get all products with filtering and sorting
exports.getProducts = async (req, res) => {
  try {
    const { category, sortBy, page = 1, limit = 12 } = req.query;
    
    let query = {};
    if (category) {
      query.category = category;
    }
    
    let sortOption = {};
    switch(sortBy) {
      case 'price_asc':
        sortOption.price = 1;
        break;
      case 'price_desc':
        sortOption.price = -1;
        break;
      case 'rating':
        sortOption.rating = -1;
        break;
      case 'newest':
        sortOption.createdAt = -1;
        break;
      default:
        sortOption.createdAt = -1;
    }
    
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single product by ID
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Create product (admin only)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);

    await writeAdminAudit(req, {
      action: 'product.create',
      targetType: 'product',
      targetId: product?._id,
      targetName: product?.name,
      status: 'success',
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    await writeAdminAudit(req, {
      action: 'product.create',
      targetType: 'product',
      status: 'failure',
      message: error.message,
    });
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update product (admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await writeAdminAudit(req, {
      action: 'product.update',
      targetType: 'product',
      targetId: product?._id || id,
      targetName: product?.name,
      status: 'success',
      meta: { fields: Object.keys(req.body || {}) },
    });
    
    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    await writeAdminAudit(req, {
      action: 'product.update',
      targetType: 'product',
      targetId: req?.params?.id,
      status: 'failure',
      message: error.message,
    });
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product (admin only)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    await writeAdminAudit(req, {
      action: 'product.delete',
      targetType: 'product',
      targetId: product?._id || id,
      targetName: product?.name,
      status: 'success',
    });
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    await writeAdminAudit(req, {
      action: 'product.delete',
      targetType: 'product',
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
