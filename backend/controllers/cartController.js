/**
 * Cart Controller
 * Server-side cart tied to authenticated user.
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findOne({ user: userId }).populate('items.product');
  }
  return cart;
}

function normalizeCart(cartDoc) {
  const cart = cartDoc?.toObject ? cartDoc.toObject({ virtuals: false }) : cartDoc;
  return {
    _id: cart?._id,
    user: cart?.user,
    items: (cart?.items || []).map((it) => ({
      product: it?.product && typeof it.product === 'object' ? it.product : null,
      productId: it?.product?._id || it?.product,
      quantity: it?.quantity,
      price: it?.priceSnapshot,
      // convenience fields for frontend
      name: it?.product?.name,
      image: it?.product?.image,
      stock: it?.product?.stock,
    })),
    updatedAt: cart?.updatedAt,
  };
}

exports.getMyCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    return res.status(200).json({ success: true, data: normalizeCart(cart) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.setCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(400).json({ success: false, message: 'quantity must be >= 0' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    const cartDoc = cart || (await Cart.create({ user: req.user.id, items: [] }));

    const idx = cartDoc.items.findIndex((it) => String(it.product) === String(productId));

    if (qty === 0) {
      if (idx >= 0) cartDoc.items.splice(idx, 1);
    } else {
      if (product.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${product.stock}, Requested: ${qty}`,
        });
      }

      const item = {
        product: product._id,
        quantity: qty,
        priceSnapshot: Number(product.price || 0),
      };

      if (idx >= 0) cartDoc.items[idx] = item;
      else cartDoc.items.push(item);
    }

    cartDoc.updatedAt = new Date();
    await cartDoc.save();

    const populated = await Cart.findById(cartDoc._id).populate('items.product');
    return res.status(200).json({ success: true, data: normalizeCart(populated) });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.clearMyCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(200).json({ success: true, data: { items: [] } });
    }
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    return res.status(200).json({ success: true, data: { items: [] } });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
