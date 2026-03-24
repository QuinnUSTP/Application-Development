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

      // Cookie-based auth: don't trust localStorage for session state.
      // We'll render navbar from server profile when possible.
      
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

        // Cookie-based auth: confirm the session is actually established.
        // If you're opening pages via file:/// this will fail and you'll look "logged out".
        try {
          await apiService.getUserProfile();
        } catch (e) {
          UIUtils.showNotification(
            'Login session not saved. Please open the site via http://127.0.0.1:5500 (use START_FRONTEND.ps1).',
            'error',
            5000
          );
        }

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
    (async () => {
      apiService.clearToken();

      // Clear cookie on server
      if (window.apiService && typeof apiService.request === 'function') {
        try {
          await apiService.request('/users/logout', { method: 'POST' });
        } catch {
          // best-effort
        }
      }

      // Clear cart locally without triggering any authenticated API calls.
      if (typeof cartManager !== 'undefined' && cartManager) {
        cartManager.cart = { items: [] };
        cartManager._emit?.('cart-updated', cartManager.cart);
      }

      UIUtils.showNotification('Logged out successfully', 'success');

      // Hard reload ensures every page re-reads the cookie session state.
      setTimeout(() => {
        window.location.replace('index.html');
        window.location.reload();
      }, 300);
    })();
  }

  /**
   * Get current user
   */
  static getCurrentUser() {
    return null;
  }

  /**
   * Check if user is logged in
   */
  static isLoggedIn() {
    // With cookies, we can't know synchronously. Treat as "unknown".
    // Call updateNavBar() which fetches /users/profile.
    return false;
  }

  /**
   * Update cart count in navbar
   */
  static updateCartCount() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
      cartCount.textContent = cartManager.getItemCount();
    }
  }

  /**
   * Update navbar to show username if logged in
   */
  static updateNavBar() {
    const accountNavItem = document.getElementById('account-nav-item');
    if (!accountNavItem) return;

    // Cookie-auth: fetch profile to decide what to render.
    apiService
      .getSessionUser()
      .then((user) => {
        if (user && user.username) {
          accountNavItem.innerHTML = `<a href="account.html"><i class="fa fa-user"></i> ${user.username}</a>`;
          return;
        }
        accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
      })
      .catch(() => {
        accountNavItem.innerHTML = `<a href="account.html">Account</a>`;
      });
  }
}

// Optional: quick session check in DevTools.
// Usage: await window.REDSTORE_SESSION()
window.REDSTORE_SESSION = async function () {
  try {
    const me = await apiService.getSessionUser();
    console.log('[RedStore] session user:', me);
    return me;
  } catch (e) {
    console.log('[RedStore] session error:', e);
    return null;
  }
};

// Force a fresh /users/profile call (bypasses any UI assumptions).
// Usage: await window.REDSTORE_REFRESH_SESSION()
window.REDSTORE_REFRESH_SESSION = async function () {
  try {
    const me = await apiService.getUserProfile();
    console.log('[RedStore] refreshed profile:', me);
    return { ok: true, me };
  } catch (e) {
    console.log('[RedStore] refreshed profile error:', e);
    return { ok: false, status: e?.status, code: e?.code, message: e?.message };
  }
};

// Initialize on page load
AuthManager.initialize();
