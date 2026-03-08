/**
 * Cart Management Module
 * Handles all cart operations with localStorage
 */

class CartManager {
  constructor() {
    this.storageKey = 'redstore_cart';
    this.cart = this.loadCart();
  }

  /**
   * Load cart from localStorage
   * @returns {Array}
   */
  loadCart() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
      this.notifyListeners('cart-updated', this.cart);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Add item to cart
   * @param {Object} product
   * @param {number} quantity
   */
  addItem(product, quantity = 1) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cart.push({
        ...product,
        quantity,
      });
    }
    
    this.saveCart();
  }

  /**
   * Remove item from cart
   * @param {number} productId
   */
  removeItem(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
  }

  /**
   * Update item quantity
   * @param {number} productId
   * @param {number} quantity
   */
  updateQuantity(productId, quantity) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.saveCart();
      }
    }
  }

  /**
   * Get all cart items
   * @returns {Array}
   */
  getItems() {
    return this.cart;
  }

  /**
   * Get cart total
   * @returns {number}
   */
  getTotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  /**
   * Get item count
   * @returns {number}
   */
  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  /**
   * Clear cart
   */
  clear() {
    this.cart = [];
    this.saveCart();
  }

  /**
   * Clear cart (alias for clear method)
   */
  clearCart() {
    this.clear();
  }

  /**
   * Subscribe to cart changes
   * @param {Function} callback
   */
  subscribe(callback) {
    if (!window._cartListeners) {
      window._cartListeners = [];
    }
    window._cartListeners.push(callback);
  }

  /**
   * Notify all listeners of cart changes
   * @param {string} event
   * @param {*} data
   */
  notifyListeners(event, data) {
    if (window._cartListeners) {
      window._cartListeners.forEach(callback => callback(event, data));
    }
  }
}

// Create and export a singleton instance
const cartManager = new CartManager();
