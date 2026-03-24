/**
 * Cart Management Module
 * Option B: Server-side cart that requires login.
 */

class CartManager {
  constructor() {
    this.cart = { items: [] };
    this._listeners = [];
    this._loading = null;
    this._authPing = null;
  }

  /**
   * Cookie-session auth: ask backend for /users/profile.
   * Returns true if logged in, false otherwise.
   */
  async isAuthenticated() {
    if (!window.apiService || typeof apiService.getUserProfile !== 'function') return false;

    if (this._authPing) return this._authPing;
    this._authPing = (async () => {
      try {
        await apiService.getUserProfile();
        return true;
      } catch (e) {
        return false;
      } finally {
        this._authPing = null;
      }
    })();

    return this._authPing;
  }

  /**
   * Load the cart from the backend (creates it if missing).
   */
  async load() {
    if (!(await this.isAuthenticated())) {
      this.cart = { items: [] };
      this._emit('cart-updated', this.cart);
      return this.cart;
    }

    if (this._loading) return this._loading;

    this._loading = (async () => {
      const res = await apiService.request('/cart', { method: 'GET' });
      this.cart = res.data || { items: [] };
      this._emit('cart-updated', this.cart);
      return this.cart;
    })();

    try {
      return await this._loading;
    } finally {
      this._loading = null;
    }
  }

  /**
   * Add quantity to an item (or set to 1 if missing).
   * @param {Object|string} product - product object or productId
   * @param {number} quantity
   */
  async addItem(product, quantity = 1) {
    if (!(await this.isAuthenticated())) {
      throw new Error('Please login to add items to your cart');
    }

    const productId = typeof product === 'string' ? product : (product?._id || product?.id);
    if (!productId) throw new Error('Invalid product');

    // Ensure we have an up-to-date cart so we can "add" by setting qty.
    await this.load();
    const existing = (this.cart.items || []).find((it) => String(it.productId) === String(productId));
    const nextQty = Number(existing?.quantity || 0) + Number(quantity || 0);
    return this.setItemQuantity(productId, nextQty);
  }

  async setItemQuantity(productId, quantity) {
    if (!(await this.isAuthenticated())) {
      throw new Error('Please login to manage your cart');
    }
    const qty = Number(quantity);
    const res = await apiService.request('/cart/item', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: qty }),
    });
    this.cart = res.data || { items: [] };
    this._emit('cart-updated', this.cart);
    return this.cart;
  }

  async removeItem(productId) {
    return this.setItemQuantity(productId, 0);
  }

  async clearCart() {
    if (!(await this.isAuthenticated())) {
      this.cart = { items: [] };
      this._emit('cart-updated', this.cart);
      return;
    }
    await apiService.request('/cart/clear', { method: 'POST' });
    this.cart = { items: [] };
    this._emit('cart-updated', this.cart);
  }

  getItems() {
    return this.cart?.items || [];
  }

  getTotal() {
    return this.getItems().reduce((total, item) => total + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
  }

  getItemCount() {
    return this.getItems().reduce((count, item) => count + Number(item.quantity || 0), 0);
  }

  subscribe(callback) {
    this._listeners.push(callback);
  }

  _emit(event, data) {
    this._listeners.forEach((cb) => {
      try {
        cb(event, data);
      } catch (e) {
        // ignore listener errors
      }
    });
  }
}

// Create and export a singleton instance
const cartManager = new CartManager();

// Export for browser globals (non-module scripts)
try {
  window.cartManager = cartManager;
  window.CartManager = CartManager;
} catch {}
