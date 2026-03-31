/**
 * API Service Layer with Database Integration
 * Handles all API calls to the backend
 * Implements JWT authentication for secure API access
 */

class APIService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    // Token is now cookie-based (httpOnly). Keep in-memory token optional for compatibility.
    this.token = null;
    this.debug = false;
  }

  setDebug(enabled) {
    this.debug = !!enabled;
  }

  log(...args) {
    if (this.debug) console.log(...args);
  }

  /**
   * Store token in-memory only.
   * (Primary auth should be via httpOnly cookie set by the backend.)
   */
  setToken(token) {
    if (token) {
      this.token = token;
      this.log('✅ Token stored');
    }
  }

  /**
   * Legacy helper: returns in-memory token if set.
   * Prefer cookie auth.
   */
  getStoredToken() {
    return this.token || null;
  }

  /**
   * Clear token on logout
   */
  clearToken() {
    this.token = null;
    this.log('✅ Token cleared');
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    // Cookie-based auth doesn't need Authorization header.
    // Keep header support if token is explicitly set (smoke tests / tooling).
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  async request(path, { method = 'GET', headers, body, timeoutMs = 8000 } = {}) {
    if (!this.baseUrl) {
      throw new Error('Backend not configured');
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: headers || this.getAuthHeaders(),
        body,
        credentials: 'include',
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || `Request failed`;
        const err = new Error(`${msg} (HTTP ${res.status})`);
        err.status = res.status;
        if (res.status === 401) err.code = 'UNAUTHENTICATED';
        if (res.status === 403) err.code = 'FORBIDDEN';
        err.data = json;
        throw err;
      }
      return json;
    } catch (e) {
      if (e?.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetch all products from backend or fallback to JSON file
   * @param {object} filters - Filter options (category, sortBy, page, limit)
   * @returns {Promise<Array>}
   */
  async getProducts(filters = {}) {
    try {
      // Backend first if available. Use request() so cookies are always included.
      if (this.baseUrl) {
        const qp = new URLSearchParams();
        Object.keys(filters).forEach((key) => {
          if (filters[key]) qp.append(key, filters[key]);
        });

        const qs = qp.toString();
        const path = `/products${qs ? `?${qs}` : ''}`;
        const result = await this.request(path, { method: 'GET' });
        const backendProducts = Array.isArray(result?.data)
          ? result.data
          : (Array.isArray(result) ? result : []);

        if (backendProducts.length > 0) {
          return backendProducts;
        }

        // Some environments have a running backend + empty DB.
        // Keep the storefront usable by falling back to bundled JSON products.
        this.log('Backend returned 0 products; falling back to local JSON data.');
      }

      // Fallback to JSON file if backend unavailable or empty
      this.log('Loading products from JSON fallback...');
      const products = await this.loadProductsFromJSON();

      const filtered = this.applyProductFilters(products, filters);
      this.log('Loaded', filtered.length, 'products from JSON');
      return filtered;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Final fallback: load from JSON silently
      try {
        const products = await this.loadProductsFromJSON();
        return this.applyProductFilters(products, filters);
      } catch (e) {
        console.error('Failed to load products:', e);
        return [];
      }
    }
  }

  /**
   * Apply frontend filtering/sorting/pagination to a product list.
   * Used for JSON fallback when backend is unavailable or DB is empty.
   */
  applyProductFilters(products = [], filters = {}) {
    let filtered = Array.isArray(products) ? [...products] : [];

    if (filters.category) {
      filtered = filtered.filter((p) => p.category === filters.category);
    }

    switch (filters.sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        break;
      case 'price_desc':
        filtered.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      default:
        break;
    }

    const hasPaging = filters.page || filters.limit;
    if (!hasPaging) return filtered;

    const page = Math.max(1, parseInt(filters.page, 10) || 1);
    const limit = Math.max(1, parseInt(filters.limit, 10) || filtered.length || 1);
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }

  /**
   * Fetch a single product by id.
   * Used by product-details.js.
   * @param {string} productId
   * @returns {Promise<Object|null>}
   */
  async getProduct(productId) {
    try {
      if (!productId) throw new Error('Missing product id');

      // Try backend first
      if (this.baseUrl) {
        try {
          const result = await this.request(`/products/${productId}`, { method: 'GET' });
          const product = result.data || result;
          return product ? this.normalizeProduct(product) : null;
        } catch (e) {
          // Fall back to JSON lookup (useful during backend hiccups)
          this.log('Backend getProduct failed, falling back to JSON:', e?.message);
        }
      }

      const products = await this.loadProductsFromJSON();
      const found = (products || []).find((p) =>
        String(p._id || p.id) === String(productId)
      );
      return found ? this.normalizeProduct(found) : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Load products from static JSON file
   * @returns {Promise<Array>}
   */
  async loadProductsFromJSON() {
    const paths = [
      './data/products.json',
      '/data/products.json',
      '/Appdev/data/products.json',
      '../data/products.json'
    ];
    
    for (let path of paths) {
      try {
        const response = await fetch(path, { cache: 'no-store' });
        if (!response.ok) continue;

        const data = await response.json();
        return data.products || data;
      } catch (e) {
        // try next path
      }
    }

    throw new Error('Unable to load products JSON');
  }

  /**
   * Normalize a product so the UI can rely on consistent fields.
   * Keeps the existing UI unchanged, but allows data-driven mapping.
   */
  normalizeProduct(product) {
    const name = String(product.name || '').trim();
    const lower = name.toLowerCase();

    if (lower.includes('red printed t-shirt')) {
      return {
        ...product,
        name: 'Red Printed T-Shirt',
        image: 'images/gallery-1.jpg',
        galleryImages: [
          'images/gallery-1.jpg',
          'images/gallery-2.jpg',
          'images/gallery-3.jpg',
          'images/gallery-4.jpg',
        ],
      };
    }

    return {
      ...product,
      galleryImages: [product.image].filter(Boolean),
    };
  }

  /**
   * Register a new user
   * @param {object} userData - { username, email, password }
   * @returns {Promise<Object>}
   */
  async registerUser(userData) {
    try {
      const result = await this.request('/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      // Store token and user data
      if (result.token) {
        this.setToken(result.token);
      }
      
  this.log('✅ User registered:', result.user);
      return result;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   * @param {object} credentials - { username, password }
   * @returns {Promise<Object>}
   */
  async loginUser(credentials) {
    try {
      const result = await this.request('/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      // Store token and user data
      if (result.token) {
        this.setToken(result.token);
      }
      
  this.log('✅ User logged in:', result.user);
      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   * @returns {Promise<Object>}
   */
  async getUserProfile() {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/users/profile', { method: 'GET' });
      return result.data || result;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {object} userData - { username, email, password }
   * @returns {Promise<Object>}
   */
  async updateUserProfile(userData) {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      this.log('✅ Profile updated:', result.user);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Save address
   * @param {object} addressData
   * @returns {Promise<Object>}
   */
  async saveAddress(addressData) {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/users/address', {
        method: 'POST',
        body: JSON.stringify(addressData),
      });
      this.log('✅ Address saved:', result);
      return result.data;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
    }
  }

  /**
   * Get saved shipping address for the current user
   * @returns {Promise<Object|null>}
   */
  async getAddress() {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/users/address', { method: 'GET' });
      return result.data ?? null;
    } catch (error) {
      console.error('Error getting address:', error);
      return null;
    }
  }

  /**
   * Change password
   * @param {object} passwordData - { currentPassword, newPassword }
   * @returns {Promise<Object>}
   */
  async changePassword(passwordData) {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/users/change-password', {
        method: 'POST',
        body: JSON.stringify(passwordData),
      });
      this.log('✅ Password changed successfully');
      return result;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Create a new order
   * @param {object} orderData - { items, totalAmount, shippingAddress, paymentMethod }
   * @returns {Promise<Object>}
   */
  async createOrder(orderData) {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });

      this.log('Order created:', result?.data?._id);
      return result.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get user's orders
   * @returns {Promise<Array>}
   */
  async getUserOrders() {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request('/orders', { method: 'GET' });
      return result?.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   * @param {string} orderId
   * @returns {Promise<Object>}
   */
  async getOrder(orderId) {
    try {
      if (!this.baseUrl) throw new Error('Backend not configured');

      const result = await this.request(`/orders/${orderId}`, { method: 'GET' });
      return result.data || result;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }

  /**
   * Cookie-session truth source: returns the logged-in user or null.
   * Never relies on localStorage.
   */
  async getSessionUser() {
    try {
      const me = await this.getUserProfile();
      return me || null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Require a cookie-session login.
   * If not logged in, throws an UNAUTHENTICATED error.
   */
  async requireLogin() {
    const me = await this.getUserProfile();
    if (!me) {
      const err = new Error('Please login to continue (HTTP 401)');
      err.status = 401;
      err.code = 'UNAUTHENTICATED';
      throw err;
    }
    return me;
  }
}

// Create and export a singleton instance
// IMPORTANT: use a single consistent backend origin for cookie auth.
// If you mix http://localhost and http://127.0.0.1, cookies won't be shared.
const backendUrl = 'http://127.0.0.1:5000/api';
const apiService = new APIService(backendUrl);

// Export for browser globals (non-module scripts)
try {
  window.apiService = apiService;
  window.APIService = APIService;
} catch {}

// Optional debug: enable verbose API logs via URL param (?debug=1)
// or by setting: window.REDSTORE_DEBUG = true
try {
  const qp = new URLSearchParams(window.location.search);
  const debug = (window.REDSTORE_DEBUG === true) || (qp.get('debug') === '1');
  apiService.setDebug(debug);
} catch {}
