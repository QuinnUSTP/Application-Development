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
      apiService?.log?.('🔐 AuthManager initialized');
      
      // Check if user is already logged in
      const userData = localStorage.getItem('user_data');
      if (userData) {
        apiService?.log?.('✅ User already logged in');
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
      apiService?.log?.('🔐 Attempting login for:', username);
      const result = await apiService.loginUser({ username, password });
      
      if (result && result.token) {
        apiService?.log?.('✅ Login successful');
        UIUtils.showNotification(`Welcome back, ${result.user.username}!`, 'success');

        // Ensure in-memory token is up to date (important if apiService was constructed before login)
        apiService.setToken(result.token);
        
        // Update navbar on all pages
        this.updateNavBar();

        // If we're on the account page, stay here and let AccountManager render the dashboard.
        // Otherwise, redirect to home.
        const isOnAccountPage = /account\.html$/i.test(window.location.pathname);
        setTimeout(() => {
          if (isOnAccountPage && window.AccountManager) {
            AccountManager.renderPage();
          } else {
            window.location.href = 'index.html';
          }
        }, 400);
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
      apiService?.log?.('🔐 Attempting registration for:', username);
      const result = await apiService.registerUser({ username, email, password });
      
      if (result && result.token) {
        apiService?.log?.('✅ Registration successful');
        UIUtils.showNotification(`Account created successfully! Welcome, ${result.user.username}!`, 'success');

        // Ensure in-memory token is up to date
        apiService.setToken(result.token);
        
        // Update navbar on all pages
        this.updateNavBar();

        const isOnAccountPage = /account\.html$/i.test(window.location.pathname);
        setTimeout(() => {
          if (isOnAccountPage && window.AccountManager) {
            AccountManager.renderPage();
          } else {
            window.location.href = 'index.html';
          }
        }, 400);
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

    // If token exists but user_data is missing/corrupt, clean up and show Account.
    if (isLoggedIn && !userData) {
      apiService?.log?.('⚠️ Token present but user_data missing; clearing token for consistency');
      apiService.clearToken();
      accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
      return;
    }

    if (isLoggedIn && userData) {
      try {
        const user = JSON.parse(userData);
        if (!user || !user.username) throw new Error('Invalid user_data');
        accountNavItem.innerHTML = `<a href="account.html"><i class="fa fa-user"></i> ${user.username}</a>`;
        apiService?.log?.('✅ Navbar updated with username:', user.username);
      } catch (e) {
        console.error('Error parsing user data:', e);
        // If cached profile is broken, drop it and show Account.
        localStorage.removeItem('user_data');
        accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
      }
      return;
    }

    accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
  }
}

// Initialize on page load
AuthManager.initialize();
