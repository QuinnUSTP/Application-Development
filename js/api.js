/**
 * API Service Layer with Database Integration
 * Handles all API calls to the backend
 * Implements JWT authentication for secure API access
 */

class APIService {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.token = this.getStoredToken();
  }

  /**
   * Store token in localStorage
   */
  setToken(token) {
    if (token) {
      this.token = token;
      localStorage.setItem('auth_token', token);
      console.log('✅ Token stored');
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
    console.log('✅ Token cleared');
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
        
        console.log('Fetching products from backend:', url.toString());
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: this.getAuthHeaders(),
          timeout: 3000,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Products fetched from backend:', result.data?.length || 0, 'items');
          return result.data || result;
        }
      }

      // Fallback to JSON file if backend unavailable
      console.log('⚠️ Backend unavailable, loading from JSON file...');
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
      
      console.log('✅ Loaded', filtered.length, 'products from JSON');
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
        console.log('Trying to load from:', path);
        const response = await fetch(path);
        if (response.ok) {
          const products = await response.json();
          console.log('✅ Loaded products from:', path);
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
        const response = await fetch(`${this.baseUrl}/products/${productId}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
          timeout: 3000,
        });

        if (response.ok) {
          const result = await response.json();
          console.log('✅ Product fetched from backend:', result.data?.name || result.name || 'Unknown');
          return result.data || result;
        } else {
          console.log('⚠️ Backend product endpoint returned:', response.status);
        }
      }

      // Fallback to JSON file
      console.log('⚠️ Falling back to JSON file for product ID:', productId);
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
        console.log('✅ Product found in JSON:', product.name);
        return product;
      }
      
      console.warn('❌ Product not found with ID:', productId, 'Available IDs:', products.map(p => p.id));
      return null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  /**
   * Register a new user
   * @param {object} userData - { username, email, password }
   * @returns {Promise<Object>}
   */
  async registerUser(userData) {
    try {
      if (!this.baseUrl) {
        throw new Error('Backend not configured');
      }

      const response = await fetch(`${this.baseUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      // Store token and user data
      if (result.token) {
        this.setToken(result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }
      
      console.log('✅ User registered:', result.user);
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
      if (!this.baseUrl) {
        throw new Error('Backend not configured');
      }

      const response = await fetch(`${this.baseUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const result = await response.json();
      
      // Store token and user data
      if (result.token) {
        this.setToken(result.token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
      }
      
      console.log('✅ User logged in:', result.user);
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

      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get profile');
      }

      const result = await response.json();
      return result.data;
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

      const response = await fetch(`${this.baseUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated:', result.user);
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get user orders
   * @returns {Promise<Array>}
   */
  async getUserOrders() {
    try {
      if (!this.baseUrl || !this.token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${this.baseUrl}/orders/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get orders');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
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

      const response = await fetch(`${this.baseUrl}/users/address`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save address');
      }

      const result = await response.json();
      console.log('✅ Address saved:', result);
      return result.data;
    } catch (error) {
      console.error('Error saving address:', error);
      throw error;
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

      const response = await fetch(`${this.baseUrl}/users/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change password');
      }

      const result = await response.json();
      console.log('✅ Password changed successfully');
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

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      const result = await response.json();
      console.log('✅ Order created:', result.data._id);
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

      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
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

      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Order not found');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      return null;
    }
  }
}

// Create and export a singleton instance
const backendUrl = 'http://localhost:5000/api';
const apiService = new APIService(backendUrl);

// Test if backend is available and provide fallback
(async () => {
  try {
    console.log('🔍 Testing backend connection at', backendUrl);
    const response = await fetch(backendUrl + '/health', { 
      method: 'GET',
      mode: 'cors'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend API is available at', backendUrl);
      console.log('   Message:', data.message);
    } else {
      console.warn('⚠️ Backend health check failed, will use JSON fallback');
    }
  } catch (e) {
    console.warn('⚠️ Backend not available, using JSON fallback:', e.message);
    console.log('   Make sure MongoDB is running and the backend server is started');
  }
})();
