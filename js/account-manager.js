/**
 * Account Manager
 * Handles account dashboard, profile editing, orders, and addresses
 */

class AccountManager {
  /**
   * Initialize account page on load
   */
  static initialize() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔐 AccountManager initialized');
      this.renderPage();
      this.updateNavBar();
      this.updateCartCount();
    });
  }

  /**
   * Render login form or dashboard based on login status
   */
  static renderPage() {
    const accountPage = document.getElementById('accountPage');
    const isLoggedIn = AuthManager.isLoggedIn();
    
    if (isLoggedIn) {
      console.log('✅ User is logged in - showing dashboard');
      this.renderDashboard(accountPage);
    } else {
      console.log('❌ User not logged in - showing login/register forms');
      this.renderLoginForms(accountPage);
    }
  }

  /**
   * Render login/register forms
   */
  static renderLoginForms(container) {
    const template = document.getElementById('loginTemplate');
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
    
    // Initialize form animations after rendering
    setTimeout(() => {
      AuthManager.showLogin();
    }, 100);
  }

  /**
   * Render account dashboard
   */
  static renderDashboard(container) {
    const template = document.getElementById('dashboardTemplate');
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
    
    // Load user data
    this.loadUserData();
    this.loadOrders();
  }

  /**
   * Load and display user data
   */
  static loadUserData() {
    const userData = localStorage.getItem('user_data');
    if (!userData) {
      console.error('No user data found');
      return;
    }

    const user = JSON.parse(userData);
    console.log('📝 Loading user data:', user);

    // Update header
    document.getElementById('dashboardUsername').textContent = user.username;
    document.getElementById('dashboardEmail').textContent = user.email;

    // Update profile view
    document.getElementById('viewUsername').textContent = user.username;
    document.getElementById('viewEmail').textContent = user.email;
    
    const joinDate = user.createdAt 
      ? new Date(user.createdAt).toLocaleDateString()
      : 'Unknown';
    document.getElementById('viewMemberSince').textContent = joinDate;

    // Pre-fill edit form
    document.getElementById('editUsername').value = user.username;
    document.getElementById('editEmail').value = user.email;
  }

  /**
   * Load user's orders
   */
  static async loadOrders() {
    const ordersList = document.getElementById('ordersList');
    
    try {
      const orders = await apiService.getUserOrders();
      console.log('📦 Orders loaded:', orders);

      if (!orders || orders.length === 0) {
        ordersList.innerHTML = `
          <div class="empty-state">
            <i class="fa fa-inbox"></i>
            <p>No orders yet</p>
            <a href="products.html" class="btn" style="margin-top: 20px;">Start Shopping</a>
          </div>
        `;
        return;
      }

      ordersList.innerHTML = orders.map(order => `
        <div class="order-card">
          <div class="order-header">
            <span class="order-id">Order #${order._id.substring(0, 8)}</span>
            <span class="order-date">${new Date(order.createdAt).toLocaleDateString()}</span>
            <span class="order-status status-${order.status}">${order.status}</span>
          </div>
          <div class="order-items">
            ${order.items.map(item => `
              <div class="order-item">
                <span>${item.quantity}x ${item.product.name || 'Product'}</span>
                <span>${UIUtils.formatPrice(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>
          <div class="order-footer">
            <span class="order-total">Total: ${UIUtils.formatPrice(order.totalAmount)}</span>
            <a href="order-details.html?id=${order._id}" class="btn-link">View Details</a>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error('Error loading orders:', error);
      ordersList.innerHTML = `
        <div class="empty-state">
          <i class="fa fa-exclamation-circle"></i>
          <p>Unable to load orders</p>
        </div>
      `;
    }
  }

  /**
   * Switch between dashboard tabs
   */
  static switchTab(tabName) {
    // Hide all tabs
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));

    // Remove active class from menu items
    const menuItems = document.querySelectorAll('.dashboard-menu .menu-item');
    menuItems.forEach(item => item.classList.remove('active'));

    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
      selectedTab.classList.add('active');
    }

    // Mark menu item as active
    event.target.closest('.menu-item').classList.add('active');

    console.log(`📄 Switched to ${tabName} tab`);
  }

  /**
   * Toggle edit mode for profile
   */
  static toggleEditMode(section) {
    if (section === 'profile') {
      const profileView = document.getElementById('profileView');
      const profileEdit = document.getElementById('profileEdit');

      if (profileEdit.style.display === 'none') {
        profileView.style.display = 'none';
        profileEdit.style.display = 'block';
      } else {
        profileView.style.display = 'block';
        profileEdit.style.display = 'none';
      }
    } else if (section === 'address') {
      const addressView = document.getElementById('addressView');
      const addressEdit = document.getElementById('addressEdit');

      if (addressEdit.style.display === 'none') {
        addressView.style.display = 'none';
        addressEdit.style.display = 'block';
      } else {
        addressView.style.display = 'block';
        addressEdit.style.display = 'none';
      }
    }
  }

  /**
   * Save profile changes
   */
  static async saveProfile(event) {
    event.preventDefault();

    const username = document.getElementById('editUsername').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const password = document.getElementById('editPassword').value;

    // Validation
    if (!username || username.length < 3) {
      UIUtils.showNotification('Username must be at least 3 characters', 'error');
      return;
    }

    if (!email || !AuthManager.isValidEmail(email)) {
      UIUtils.showNotification('Please enter a valid email', 'error');
      return;
    }

    try {
      const userData = {
        username,
        email,
      };

      if (password && password.length >= 6) {
        userData.password = password;
      }

      console.log('💾 Saving profile changes...');
      const result = await apiService.updateUserProfile(userData);

      // Update local storage
      localStorage.setItem('user_data', JSON.stringify(result.user));

      UIUtils.showNotification('Profile updated successfully!', 'success');
      this.toggleEditMode('profile');
      this.loadUserData();
      this.updateNavBar();
    } catch (error) {
      console.error('Error updating profile:', error);
      UIUtils.showNotification(error.message || 'Failed to update profile', 'error');
    }
  }

  /**
   * Save address
   */
  static async saveAddress(event) {
    event.preventDefault();

    const address = {
      name: document.getElementById('addressName').value.trim(),
      street: document.getElementById('addressStreet').value.trim(),
      city: document.getElementById('addressCity').value.trim(),
      state: document.getElementById('addressState').value.trim(),
      zip: document.getElementById('addressZip').value.trim(),
      country: document.getElementById('addressCountry').value.trim(),
    };

    // Validation
    if (!address.name || !address.street || !address.city || !address.state) {
      UIUtils.showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      console.log('💾 Saving address...');
      const result = await apiService.saveAddress(address);

      UIUtils.showNotification('Address saved successfully!', 'success');
      this.toggleEditMode('address');
      
      // Reload addresses
      const addressView = document.getElementById('addressView');
      addressView.innerHTML = `
        <div class="address-card">
          <h4>${result.name}</h4>
          <p>${result.street}</p>
          <p>${result.city}, ${result.state} ${result.zip}</p>
          <p>${result.country}</p>
        </div>
      `;
    } catch (error) {
      console.error('Error saving address:', error);
      UIUtils.showNotification(error.message || 'Failed to save address', 'error');
    }
  }

  /**
   * Toggle change password form
   */
  static toggleChangePassword() {
    const form = document.getElementById('changePasswordForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
  }

  /**
   * Change password
   */
  static async changePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      UIUtils.showNotification('All password fields are required', 'error');
      return;
    }

    if (newPassword.length < 6) {
      UIUtils.showNotification('New password must be at least 6 characters', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      UIUtils.showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      console.log('🔐 Changing password...');
      await apiService.changePassword({ currentPassword, newPassword });

      UIUtils.showNotification('Password changed successfully!', 'success');
      this.toggleChangePassword();
      
      // Clear form
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';
    } catch (error) {
      console.error('Error changing password:', error);
      UIUtils.showNotification(error.message || 'Failed to change password', 'error');
    }
  }

  /**
   * Update cart count display
   */
  static updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      const items = cartManager.getItems();
      cartCount.textContent = items.length;
    }
  }

  /**
   * Update navbar to show username if logged in
   */
  static updateNavBar() {
    const accountNavItem = document.getElementById('account-nav-item');
    if (!accountNavItem) return;

    const isLoggedIn = AuthManager.isLoggedIn();
    const userData = localStorage.getItem('user_data');

    if (isLoggedIn && userData) {
      const user = JSON.parse(userData);
      accountNavItem.innerHTML = `<a href="account.html"><i class="fa fa-user"></i> ${user.username}</a>`;
    } else {
      accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
    }
  }
}

// Initialize on page load
AccountManager.initialize();
