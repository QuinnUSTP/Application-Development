/**
 * Admin Manager
 * Handles all admin panel functionality for managing products, users, and orders
 */

class AdminManager {
  /**
   * Initialize admin panel on page load
   */
  static initialize() {
    const accountPage = document.getElementById('accountPage');
    if (!accountPage) return;

    const userData = localStorage.getItem('user_data');
    if (!userData) return;

    try {
      const user = JSON.parse(userData);
      if (user.role === 'admin') {
        this.renderAdminPanel();
      } else {
        // Regular user - account manager will handle it
        AccountManager.initialize();
      }
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }

  /**
   * Render the admin panel
   */
  static renderAdminPanel() {
    const accountPage = document.getElementById('accountPage');
    if (!accountPage) return;

    accountPage.innerHTML = `
      <div class="admin-container">
        <div class="admin-header">
          <h1>🔐 Admin Dashboard</h1>
          <button class="btn-logout" onclick="AdminManager.logout()">Logout</button>
        </div>

        <div class="admin-tabs">
          <button class="admin-tab-btn active" onclick="AdminManager.switchTab('products')">
            📦 Products
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('users')">
            👥 Users
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('orders')">
            📋 Orders
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('settings')">
            ⚙️ Settings
          </button>
        </div>

        <!-- Products Tab -->
        <div id="admin-products" class="admin-tab-content active">
          <div class="admin-section">
            <h2>Products Management</h2>
            <button class="btn btn-primary" onclick="AdminManager.showAddProductForm()">
              ➕ Add New Product
            </button>
            <div id="productsList" class="products-table"></div>
            <div id="addProductForm" style="display: none;" class="admin-form">
              <h3>Add New Product</h3>
              <form onsubmit="AdminManager.addProduct(event)">
                <div class="form-group">
                  <label>Product Name:</label>
                  <input type="text" id="productName" required>
                </div>
                <div class="form-group">
                  <label>Price:</label>
                  <input type="number" id="productPrice" step="0.01" required>
                </div>
                <div class="form-group">
                  <label>Category:</label>
                  <input type="text" id="productCategory" required>
                </div>
                <div class="form-group">
                  <label>Description:</label>
                  <textarea id="productDescription" required></textarea>
                </div>
                <div class="form-group">
                  <label>Image URL:</label>
                  <input type="text" id="productImage" required>
                </div>
                <div class="form-group">
                  <label>Stock:</label>
                  <input type="number" id="productStock" min="0" required>
                </div>
                <div class="form-group">
                  <label>Rating:</label>
                  <input type="number" id="productRating" step="0.1" min="0" max="5">
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">Save Product</button>
                  <button type="button" class="btn btn-secondary" onclick="AdminManager.hideAddProductForm()">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Users Tab -->
        <div id="admin-users" class="admin-tab-content">
          <div class="admin-section">
            <h2>Users Management</h2>
            <div id="usersList" class="users-table"></div>
          </div>
        </div>

        <!-- Orders Tab -->
        <div id="admin-orders" class="admin-tab-content">
          <div class="admin-section">
            <h2>Orders Management</h2>
            <div id="ordersList" class="orders-table"></div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div id="admin-settings" class="admin-tab-content">
          <div class="admin-section">
            <h2>Admin Settings</h2>
            <div class="setting-item">
              <label>Admin Username:</label>
              <p id="adminUsername"></p>
            </div>
            <div class="setting-item">
              <label>Admin Email:</label>
              <p id="adminEmail"></p>
            </div>
            <button class="btn btn-warning" onclick="AdminManager.changeAdminPassword()">
              Change Password
            </button>
            <div id="changePasswordForm" style="display: none;" class="admin-form">
              <h3>Change Password</h3>
              <form onsubmit="AdminManager.submitChangePassword(event)">
                <div class="form-group">
                  <label>Current Password:</label>
                  <input type="password" id="currentPassword" required>
                </div>
                <div class="form-group">
                  <label>New Password:</label>
                  <input type="password" id="newPassword" required>
                </div>
                <div class="form-group">
                  <label>Confirm Password:</label>
                  <input type="password" id="confirmPassword" required>
                </div>
                <div class="form-actions">
                  <button type="submit" class="btn btn-success">Update Password</button>
                  <button type="button" class="btn btn-secondary" onclick="AdminManager.toggleChangePasswordForm()">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    // Load initial data
    this.loadProducts();
    this.loadUsers();
    this.loadOrders();
    this.loadAdminInfo();
  }

  /**
   * Switch between admin tabs
   */
  static switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected tab
    const tabElement = document.getElementById(`admin-${tabName}`);
    if (tabElement) {
      tabElement.classList.add('active');
    }

    // Mark button as active
    event.target.classList.add('active');
  }

  /**
   * Load products and display in table
   */
  static async loadProducts() {
    try {
      const response = await apiService.getProducts({ limit: 100 });
      const products = Array.isArray(response) ? response : response.data || [];

      const productsList = document.getElementById('productsList');
      if (!productsList) return;

      if (products.length === 0) {
        productsList.innerHTML = '<p>No products found</p>';
        return;
      }

      let html = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      products.forEach(product => {
        const productId = product._id || product.id;
        html += `
          <tr>
            <td>${productId}</td>
            <td>${product.name}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
              <input type="number" value="${product.stock}" class="stock-input" 
                onchange="AdminManager.updateStock('${productId}', this.value)">
            </td>
            <td>${product.category}</td>
            <td>
              <button class="btn-edit" onclick="AdminManager.editProduct('${productId}')">Edit</button>
              <button class="btn-delete" onclick="AdminManager.deleteProduct('${productId}', '${product.name}')">Delete</button>
            </td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      productsList.innerHTML = html;
    } catch (error) {
      console.error('Error loading products:', error);
      document.getElementById('productsList').innerHTML = '<p class="error">Error loading products</p>';
    }
  }

  /**
   * Load users and display in table
   */
  static async loadUsers() {
    try {
      // Since we might not have a dedicated user list endpoint, we'll create one
      const response = await fetch('http://localhost:5000/api/users/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok && response.status === 404) {
        document.getElementById('usersList').innerHTML = '<p>User list endpoint not yet implemented</p>';
        return;
      }

      const result = await response.json();
      const users = result.data || [];

      const usersList = document.getElementById('usersList');
      if (!usersList) return;

      if (users.length === 0) {
        usersList.innerHTML = '<p>No users found</p>';
        return;
      }

      let html = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      users.forEach(user => {
        const createdDate = new Date(user.createdAt).toLocaleDateString();
        html += `
          <tr>
            <td>${user._id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td><span class="badge ${user.role}">${user.role}</span></td>
            <td>${createdDate}</td>
            <td>
              ${user.role !== 'admin' ? `<button class="btn-promote" onclick="AdminManager.promoteToAdmin('${user._id}')">Promote</button>` : '<span>Admin</span>'}
            </td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      usersList.innerHTML = html;
    } catch (error) {
      console.error('Error loading users:', error);
      document.getElementById('usersList').innerHTML = '<p>User management not yet available</p>';
    }
  }

  /**
   * Load orders and display in table
   */
  static async loadOrders() {
    try {
      // Get all orders - we might need to create an admin endpoint for this
      const response = await fetch('http://localhost:5000/api/orders/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok && response.status === 404) {
        document.getElementById('ordersList').innerHTML = '<p>Orders endpoint not yet implemented</p>';
        return;
      }

      const result = await response.json();
      const orders = result.data || [];

      const ordersList = document.getElementById('ordersList');
      if (!ordersList) return;

      if (orders.length === 0) {
        ordersList.innerHTML = '<p>No orders found</p>';
        return;
      }

      let html = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Items</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
      `;

      orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const itemCount = order.items ? order.items.length : 0;
        html += `
          <tr>
            <td>${order._id}</td>
            <td>${order.user.username || 'N/A'}</td>
            <td>$${order.totalAmount.toFixed(2)}</td>
            <td>${itemCount}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${orderDate}</td>
            <td>
              <select onchange="AdminManager.updateOrderStatus('${order._id}', this.value)">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
              </select>
            </td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;

      ordersList.innerHTML = html;
    } catch (error) {
      console.error('Error loading orders:', error);
      document.getElementById('ordersList').innerHTML = '<p>Orders management not yet available</p>';
    }
  }

  /**
   * Load admin information
   */
  static loadAdminInfo() {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;

      const user = JSON.parse(userData);
      document.getElementById('adminUsername').textContent = user.username;
      document.getElementById('adminEmail').textContent = user.email;
    } catch (e) {
      console.error('Error loading admin info:', e);
    }
  }

  /**
   * Show add product form
   */
  static showAddProductForm() {
    const form = document.getElementById('addProductForm');
    if (form) {
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * Hide add product form
   */
  static hideAddProductForm() {
    const form = document.getElementById('addProductForm');
    if (form) {
      form.style.display = 'none';
      // Clear form
      document.getElementById('productName').value = '';
      document.getElementById('productPrice').value = '';
      document.getElementById('productCategory').value = '';
      document.getElementById('productDescription').value = '';
      document.getElementById('productImage').value = '';
      document.getElementById('productStock').value = '';
      document.getElementById('productRating').value = '';
    }
  }

  /**
   * Add new product
   */
  static async addProduct(event) {
    event.preventDefault();

    const productData = {
      name: document.getElementById('productName').value,
      price: parseFloat(document.getElementById('productPrice').value),
      category: document.getElementById('productCategory').value,
      description: document.getElementById('productDescription').value,
      image: document.getElementById('productImage').value,
      stock: parseInt(document.getElementById('productStock').value),
      rating: parseFloat(document.getElementById('productRating').value) || 0
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add product');
      }

      UIUtils.showNotification('✅ Product added successfully!', 'success');
      this.hideAddProductForm();
      this.loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(productId, productName) {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      UIUtils.showNotification('✅ Product deleted successfully!', 'success');
      this.loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Update product stock
   */
  static async updateStock(productId, newStock) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: parseInt(newStock) })
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      UIUtils.showNotification('✅ Stock updated!', 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
      this.loadProducts();
    }
  }

  /**
   * Edit product (placeholder)
   */
  static editProduct(productId) {
    UIUtils.showNotification('Edit feature coming soon!', 'info');
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId, newStatus) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      UIUtils.showNotification('✅ Order status updated!', 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
      this.loadOrders();
    }
  }

  /**
   * Toggle change password form
   */
  static toggleChangePasswordForm() {
    const form = document.getElementById('changePasswordForm');
    if (form) {
      form.style.display = form.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Show change password form
   */
  static changeAdminPassword() {
    this.toggleChangePasswordForm();
  }

  /**
   * Submit password change
   */
  static async submitChangePassword(event) {
    event.preventDefault();

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      UIUtils.showNotification('❌ Passwords do not match!', 'error');
      return;
    }

    try {
      const response = await apiService.changePassword({
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: newPassword
      });

      UIUtils.showNotification('✅ Password changed successfully!', 'success');
      this.toggleChangePasswordForm();
      // Clear form
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (error) {
      console.error('Error changing password:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Promote user to admin
   */
  static async promoteToAdmin(userId) {
    if (!confirm('Are you sure you want to promote this user to admin?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${userId}/promote`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to promote user');
      }

      UIUtils.showNotification('✅ User promoted to admin!', 'success');
      this.loadUsers();
    } catch (error) {
      console.error('Error promoting user:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Logout admin
   */
  static logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      window.location.href = 'account.html';
    }
  }
}

// Initialize admin manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AdminManager.initialize();
});
