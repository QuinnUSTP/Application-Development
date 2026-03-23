/**
 * API Service Layer with Database Integration
 * Handles all API calls to the backend
 * Implements JWT authentication for secure API access
 */

class APIService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.token = this.getStoredToken();
    this.debug = false;
  }

  setDebug(enabled) {
    this.debug = !!enabled;
  }

  log(...args) {
    if (this.debug) console.log(...args);
  }

  /**
   * Store token in localStorage
   */
  setToken(token) {
    if (token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
      this.log('✅ Token stored');
    }
  }

  /**
   * Get stored token from localStorage
   */
  getStoredToken() {
    return localStorage.getItem('auth_token') || null;
  }

  /**
   * Clear token on logout
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    this.log('✅ Token cleared');
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(path, { method = 'GET', headers, body, timeoutMs = 8000 } = {}) {
    if (!this.baseUrl) {
      throw new Error('Backend not configured');
    }

    // Refresh token (login can happen without reload)
    this.token = this.getStoredToken();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: headers || this.getAuthHeaders(),
        body,
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.message || `Request failed (HTTP ${res.status})`;
        throw new Error(msg);
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
      // Try backend first if available
      if (this.baseUrl) {
        const url = new URL(`${this.baseUrl}/products`);
        Object.keys(filters).forEach(key => {
          if (filters[key]) url.searchParams.append(key, filters[key]);
        });
        
        this.log('Fetching products from backend:', url.toString());
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(url.toString(), {
            method: 'GET',
            headers: this.getAuthHeaders(),
            signal: controller.signal,
          });

          if (response.ok) {
            const result = await response.json();
            this.log('Products fetched from backend:', result.data?.length || 0, 'items');
            return result.data || result;
          }
        } finally {
          clearTimeout(timer);
        }
      }

      // Fallback to JSON file if backend unavailable
  this.log('Backend unavailable, loading from JSON file...');
      const products = await this.loadProductsFromJSON();
      
      // Apply filters to JSON data
      let filtered = products;
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      
      // Apply sorting
      if (filters.sortBy) {
        switch(filters.sortBy) {
          case 'price_asc':
            filtered.sort((a, b) => a.price - b.price);
            break;
          case 'price_desc':
            filtered.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
          case 'newest':
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
        }
      }
      
      this.log('Loaded', filtered.length, 'products from JSON');
      return filtered;
    } catch (error) {
      console.error('Error fetching products:', error);
      // Final fallback: load from JSON silently
      try {
        return await this.loadProductsFromJSON();
      } catch (e) {
        console.error('Failed to load products:', e);
        return [];
      }
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
        this.log('Trying to load from:', path);
        const response = await fetch(path);
        if (response.ok) {
          const products = await response.json();
          this.log('✅ Loaded products from:', path);
          return Array.isArray(products) ? products : [];
        }
      } catch (e) {
        // Try next path
      }
    }
    
    throw new Error('Could not load products from any source');
  }

  /**
   * Fetch a single product by ID from backend or JSON
   * @param {string} productId
   * @returns {Promise<Object>}
   */
  async getProduct(productId) {
    try {
      // Try backend first if available
      if (this.baseUrl) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(`${this.baseUrl}/products/${productId}`, {
            method: 'GET',
            headers: this.getAuthHeaders(),
            signal: controller.signal,
          });

          if (response.ok) {
            const result = await response.json();
            this.log('Product fetched from backend:', result.data?.name || result.name || 'Unknown');
            return result.data || result;
          }
        } finally {
          clearTimeout(timer);
        }
      }

    // Fallback to JSON file
    this.log('Falling back to JSON file for product ID:', productId);
      const products = await this.loadProductsFromJSON();
      
      // Try multiple ID matching approaches (string, number, MongoDB ObjectId)
      const product = products.find(p => {
        const idMatch = 
          String(p.id) === String(productId) ||  // Both as strings
          Number(p.id) === Number(productId) ||  // Both as numbers
          p._id === productId ||                 // MongoDB ObjectId
          p.id == productId;                     // Loose equality
        return idMatch;
      });
      
      if (product) {
        this.log('Product found in JSON:', product.name);
        return this.normalizeProduct(product);
      }
      
      console.warn('Product not found with ID:', productId);
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
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
        localStorage.setItem('user_data', JSON.stringify(result.user));
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
        localStorage.setItem('user_data', JSON.stringify(result.user));
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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

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
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

      const result = await this.request(`/orders/${orderId}`, { method: 'GET' });
      return result.data || result;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const backendUrl = 'http://localhost:5000/api';
const apiService = new APIService(backendUrl);

// Optional debug: enable verbose API logs via localStorage key.
// localStorage.setItem('redstore_debug', '1')
try {
  apiService.setDebug(localStorage.getItem('redstore_debug') === '1');
} catch {}
