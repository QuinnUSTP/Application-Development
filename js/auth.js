/**
 * Authentication Manager
 * Handles user login, registration, and session management
 */

class AuthManager {
  /**
   * Initialize authentication on page load
   */
  static initialize() {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('🔐 AuthManager initialized');
      
      // Check if user is already logged in
      const userData = localStorage.getItem('user_data');
      if (userData) {
        console.log('✅ User already logged in');
      }
      
      // Update cart count
      this.updateCartCount();
      
      // Update navbar
      this.updateNavBar();
      
      // Default to login view (only if on account page with forms)
      const loginForm = document.getElementById('LoginForm');
      if (loginForm) {
        this.showLogin();
      }
    });
  }

  /**
   * Show login form
   */
  static showLogin() {
    const RegForm = document.getElementById("RegForm");
    const LoginForm = document.getElementById("LoginForm");
    const Indicator = document.getElementById("Indicator");
    
    if (RegForm && LoginForm && Indicator) {
      RegForm.style.transform = "translateX(300px)";
      LoginForm.style.transform = "translateX(300px)";
      Indicator.style.transform = "translateX(0px)";
    }
  }

  /**
   * Show register form
   */
  static showRegister() {
    const RegForm = document.getElementById("RegForm");
    const LoginForm = document.getElementById("LoginForm");
    const Indicator = document.getElementById("Indicator");
    
    if (RegForm && LoginForm && Indicator) {
      RegForm.style.transform = "translateX(0px)";
      LoginForm.style.transform = "translateX(0px)";
      Indicator.style.transform = "translateX(100px)";
    }
  }

  /**
   * Handle login form submission
   */
  static async handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
      UIUtils.showNotification('Please enter username and password', 'error');
      return;
    }
    
    try {
      console.log('🔐 Attempting login for:', username);
      const result = await apiService.loginUser({ username, password });
      
      if (result && result.token) {
        console.log('✅ Login successful');
        UIUtils.showNotification(`Welcome back, ${result.user.username}!`, 'success');
        
        // Update navbar on all pages
        this.updateNavBar();
        
        // Redirect to home page after 1 second
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      UIUtils.showNotification(error.message || 'Login failed', 'error');
    }
  }

  /**
   * Handle register form submission
   */
  static async handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    
    // Validation
    if (!username || username.length < 3) {
      UIUtils.showNotification('Username must be at least 3 characters', 'error');
      return;
    }
    
    if (!email || !this.isValidEmail(email)) {
      UIUtils.showNotification('Please enter a valid email', 'error');
      return;
    }
    
    if (!password || password.length < 6) {
      UIUtils.showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    
    try {
      console.log('🔐 Attempting registration for:', username);
      const result = await apiService.registerUser({ username, email, password });
      
      if (result && result.token) {
        console.log('✅ Registration successful');
        UIUtils.showNotification(`Account created successfully! Welcome, ${result.user.username}!`, 'success');
        
        // Update navbar on all pages
        this.updateNavBar();
        
        // Redirect to home page after 1 second
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      UIUtils.showNotification(error.message || 'Registration failed', 'error');
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Logout user
   */
  static logout() {
    apiService.clearToken();
    localStorage.removeItem('user_data');
    
    // Clear cart on logout
    if (typeof cartManager !== 'undefined') {
      cartManager.clearCart();
    }
    
    UIUtils.showNotification('Logged out successfully', 'success');
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }

  /**
   * Get current user
   */
  static getCurrentUser() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn() {
    return !!apiService.getStoredToken();
  }

  /**
   * Update cart count in navbar
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

    const isLoggedIn = this.isLoggedIn();
    const userData = localStorage.getItem('user_data');

    if (isLoggedIn && userData) {
      try {
        const user = JSON.parse(userData);
        accountNavItem.innerHTML = `<a href="account.html"><i class="fa fa-user"></i> ${user.username}</a>`;
        console.log('✅ Navbar updated with username:', user.username);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    } else {
      accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
    }
  }
}

// Initialize on page load
AuthManager.initialize();
