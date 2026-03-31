/**
 * Admin Manager
 * Handles all admin panel functionality for managing products, users, and orders
 */

class AdminManager {
  static _productsCache = [];
  static _productFilters = { q: '', lowStockOnly: false };
  static _ordersCache = [];
  static _metricsRefreshTimer = null;

  static _activityState = {
    q: '',
    action: '',
    status: '',
    page: 1,
    limit: 50,
  };

  /**
   * Initialize admin panel on page load
   */
  static initialize() {
    const accountPage = document.getElementById('accountPage');
    if (!accountPage) return;

    // Cookie-session auth: determine role by asking the backend.
    (async () => {
      try {
        const me = await apiService.getUserProfile();
        if (me?.role === 'admin') {
          this.renderAdminPanel();
          return;
        }
      } catch (e) {
        // ignore
      }

      // Regular user (or not logged in) - account manager will handle it
      AccountManager.initialize();
    })();
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
          <button class="admin-tab-btn active" onclick="AdminManager.switchTab('overview', event)">
            📊 Overview
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('products', event)">
            📦 Products
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('users', event)">
            👥 Users
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('orders', event)">
            📋 Orders
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('activity', event); AdminManager.loadActivity()">
            🧾 Activity Log
          </button>
          <button class="admin-tab-btn" onclick="AdminManager.switchTab('settings', event)">
            ⚙️ Settings
          </button>
        </div>

        <!-- Overview Tab -->
        <div id="admin-overview" class="admin-tab-content active">
          <div class="admin-section">
            <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
              <h2 style="margin:0;">Operations Overview</h2>
              <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <button class="btn btn-secondary" onclick="AdminManager.refreshMetrics()">🔄 Refresh</button>
                <button class="btn btn-secondary" onclick="AdminManager.openDbSchemaViewer()">🗂️ DB Schema</button>
                <label style="display:flex;gap:8px;align-items:center;cursor:pointer;user-select:none;">
                  <input type="checkbox" id="adminAutoRefresh" onchange="AdminManager.toggleAutoRefresh(this.checked)">
                  <span>Auto refresh (30s)</span>
                </label>
              </div>
            </div>

            <div id="adminMetricsStatus" style="margin-top:10px;color:#666;"></div>

            <div id="adminMetricsGrid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-top:14px;"></div>
          </div>
        </div>

  <!-- Products Tab -->
  <div id="admin-products" class="admin-tab-content">
          <div class="admin-section">
            <h2>Products Management</h2>
            <div class="admin-toolbar" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0 16px;">
              <input
                id="adminProductSearch"
                type="text"
                placeholder="Search products (name/category/id)…"
                style="flex:1;min-width:240px;padding:10px 12px;border:1px solid #ddd;border-radius:8px;"
                oninput="AdminManager.setProductSearch(this.value)"
              />
              <label style="display:flex;gap:8px;align-items:center;cursor:pointer;user-select:none;">
                <input id="adminLowStockOnly" type="checkbox" onchange="AdminManager.setLowStockOnly(this.checked)">
                <span>Low stock only</span>
              </label>
            </div>
            <button class="btn btn-primary" onclick="AdminManager.showAddProductForm()">
              ➕ Add New Product
            </button>
            <div id="productsList" class="products-table"></div>

            <!-- Edit Product Modal -->
            <div id="editProductModal" class="admin-modal" style="display:none;">
              <div class="admin-modal-content">
                <div class="admin-modal-header">
                  <h3>✏️ Edit Product</h3>
                  <button type="button" class="admin-modal-close" onclick="AdminManager.closeEditProductModal()">&times;</button>
                </div>
                <form id="editProductForm" onsubmit="AdminManager.submitEditProduct(event)">
                  <input type="hidden" id="editProductId">
                  <div class="form-group">
                    <label>Product Name:</label>
                    <input type="text" id="editProductName" required>
                  </div>
                  <div class="form-group">
                    <label>Price:</label>
                    <input type="number" id="editProductPrice" step="0.01" min="0" required>
                  </div>
                  <div class="form-group">
                    <label>Category:</label>
                    <input type="text" id="editProductCategory" required>
                  </div>
                  <div class="form-group">
                    <label>Description:</label>
                    <textarea id="editProductDescription" required></textarea>
                  </div>
                  <div class="form-group">
                    <label>Image URL:</label>
                    <input type="text" id="editProductImage" required>
                  </div>
                  <div class="form-group">
                    <label>Stock:</label>
                    <input type="number" id="editProductStock" min="0" required>
                  </div>
                  <div class="form-group">
                    <label>Rating:</label>
                    <input type="number" id="editProductRating" step="0.1" min="0" max="5">
                  </div>
                  <div class="form-actions">
                    <button type="submit" class="btn btn-success">Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="AdminManager.closeEditProductModal()">Cancel</button>
                  </div>
                </form>
              </div>
            </div>

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

            <!-- Order Details Modal -->
            <div id="orderDetailsModal" class="admin-modal" style="display:none;">
              <div class="admin-modal-content">
                <div class="admin-modal-header">
                  <h3>📋 Order Details</h3>
                  <button type="button" class="admin-modal-close" onclick="AdminManager.closeOrderDetailsModal()">&times;</button>
                </div>
                <div id="orderDetailsBody" style="padding:16px;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Tab -->
        <div id="admin-activity" class="admin-tab-content">
          <div class="admin-section">
            <div style="display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;">
              <h2 style="margin:0;">Admin Activity Log</h2>
              <button class="btn btn-secondary" onclick="AdminManager.loadActivity(true)">🔄 Refresh</button>
            </div>

            <div class="admin-toolbar" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0 16px;">
              <input
                id="adminActivitySearch"
                type="text"
                placeholder="Search (actor/action/target/message)…"
                style="flex:1;min-width:240px;padding:10px 12px;border:1px solid #ddd;border-radius:8px;"
                oninput="AdminManager.setActivitySearch(this.value)"
              />
              <select id="adminActivityAction" style="padding:10px 12px;border:1px solid #ddd;border-radius:8px;" onchange="AdminManager.setActivityAction(this.value)">
                <option value="">All actions</option>
                <option value="product.create">product.create</option>
                <option value="product.update">product.update</option>
                <option value="product.delete">product.delete</option>
                <option value="user.promote">user.promote</option>
                <option value="order.status.update">order.status.update</option>
              </select>
              <select id="adminActivityStatus" style="padding:10px 12px;border:1px solid #ddd;border-radius:8px;" onchange="AdminManager.setActivityStatus(this.value)">
                <option value="">All status</option>
                <option value="success">success</option>
                <option value="failure">failure</option>
              </select>
            </div>

            <div id="activityStatus" style="margin-top:6px;color:#666;"></div>
            <div id="activityList" class="orders-table"></div>
            <div id="activityPager" style="display:flex;gap:10px;align-items:center;justify-content:flex-end;margin-top:12px;"></div>
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
    this.refreshMetrics();
    this.loadProducts();
    this.loadUsers();
    this.loadOrders();
    this.loadActivity();
    this.loadAdminInfo();
  }

  static setActivityStatusText(text, isError = false) {
    const el = document.getElementById('activityStatus');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? '#b00020' : '#666';
  }

  static setActivitySearch(q) {
    this._activityState.q = String(q || '').trim();
    this._activityState.page = 1;
    this.loadActivity();
  }

  static setActivityAction(action) {
    this._activityState.action = String(action || '').trim();
    this._activityState.page = 1;
    this.loadActivity();
  }

  static setActivityStatus(status) {
    this._activityState.status = String(status || '').trim();
    this._activityState.page = 1;
    this.loadActivity();
  }

  static async loadActivity(force = false) {
    const list = document.getElementById('activityList');
    const pager = document.getElementById('activityPager');
    if (!list || !pager) return;

    if (force) {
      // no cache right now; placeholder for later
    }

    const { q, action, status, page, limit } = this._activityState;
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    if (q) params.set('q', q);
    if (action) params.set('action', action);
    if (status) params.set('status', status);

    this.setActivityStatusText('Loading activity…');
    list.innerHTML = '';
    pager.innerHTML = '';

    try {
      const resp = await apiService.request(`/admin/activity?${params.toString()}`, { method: 'GET' });
      const items = Array.isArray(resp?.data) ? resp.data : [];

      if (!items.length) {
        this.setActivityStatusText('No activity found for the current filters.');
        list.innerHTML = '<p>No activity entries yet.</p>';
        return;
      }

      let html = `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Status</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
      `;

      items.forEach(it => {
        const time = it?.createdAt ? new Date(it.createdAt).toLocaleString() : '—';
        const actor = it?.actor?.username ? `${it.actor.username} (${it.actor.role})` : '—';
        const act = it?.action || '—';
        const tgtType = it?.target?.type || '—';
        const tgtName = it?.target?.name || it?.target?.id || '—';
        const tgt = `${tgtType}: ${tgtName}`;
        const st = it?.status || '—';
        const msg = it?.message || '';
        const stStyle = st === 'failure' ? 'style="color:#b00020;font-weight:700;"' : '';
        html += `
          <tr>
            <td>${time}</td>
            <td>${actor}</td>
            <td><code>${act}</code></td>
            <td>${tgt}</td>
            <td ${stStyle}>${st}</td>
            <td style="max-width:420px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${msg.replace(/"/g, '&quot;')}">${msg}</td>
          </tr>
        `;
      });

      html += '</tbody></table>';
      list.innerHTML = html;

      const pages = Number(resp?.pages || 1);
      const total = Number(resp?.total || items.length);
      this.setActivityStatusText(`Showing ${items.length} of ${total} (page ${page} of ${pages})`);

      const prevDisabled = page <= 1 ? 'disabled' : '';
      const nextDisabled = page >= pages ? 'disabled' : '';
      pager.innerHTML = `
        <button class="btn btn-secondary" ${prevDisabled} onclick="AdminManager.changeActivityPage(${page - 1})">← Prev</button>
        <button class="btn btn-secondary" ${nextDisabled} onclick="AdminManager.changeActivityPage(${page + 1})">Next →</button>
      `;
    } catch (e) {
      this.setActivityStatusText(
        e?.status === 401 || e?.status === 403
          ? 'Not authorized to view activity. Please login with an admin account.'
          : `Failed to load activity: ${e?.message || e}`,
        true
      );
      list.innerHTML = '<p class="error">Error loading activity</p>';
    }
  }

  static changeActivityPage(nextPage) {
    const page = Math.max(1, Number(nextPage || 1));
    this._activityState.page = page;
    this.loadActivity();
  }

  static setMetricsStatus(text, isError = false) {
    const el = document.getElementById('adminMetricsStatus');
    if (!el) return;
    el.textContent = text || '';
    el.style.color = isError ? '#b00020' : '#666';
  }

  static renderMetricCard({ title, value, subtitle, tone = 'neutral' }) {
    const toneMap = {
      neutral: { bg: '#fff', border: '#e6e6e6' },
      good: { bg: '#f0fff4', border: '#b7ebc6' },
      warn: { bg: '#fffaf0', border: '#ffe0a3' },
      bad: { bg: '#fff5f5', border: '#ffb8b8' },
    };
    const t = toneMap[tone] || toneMap.neutral;
    return `
      <div style="background:${t.bg};border:1px solid ${t.border};border-radius:12px;padding:14px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
        <div style="font-size:13px;color:#444;">${title}</div>
        <div style="font-size:28px;font-weight:700;margin-top:6px;">${value}</div>
        ${subtitle ? `<div style="margin-top:6px;color:#666;font-size:12px;line-height:1.3;">${subtitle}</div>` : ''}
      </div>
    `;
  }

  static async refreshMetrics() {
    const grid = document.getElementById('adminMetricsGrid');
    if (!grid) return;

    this.setMetricsStatus('Loading metrics…');
    grid.innerHTML = '';

    try {
      const [health, metrics] = await Promise.all([
        apiService.request('/health', { method: 'GET' }),
        apiService.request('/admin/metrics', { method: 'GET' }),
      ]);

      const healthTone = health?.success ? 'good' : 'bad';
      const pending = metrics?.data?.orders?.pending ?? 0;
      const lowStock = metrics?.data?.products?.lowStock ?? 0;
      const lowStockThreshold = metrics?.data?.products?.lowStockThreshold ?? 5;

      grid.innerHTML = [
        this.renderMetricCard({
          title: 'API Health',
          value: health?.success ? 'OK' : 'Down',
          subtitle: health?.message || '—',
          tone: healthTone,
        }),
        this.renderMetricCard({
          title: 'Products',
          value: metrics?.data?.products?.total ?? '—',
          subtitle: `Low stock (≤ ${lowStockThreshold}): ${lowStock}`,
          tone: lowStock > 0 ? 'warn' : 'good',
        }),
        this.renderMetricCard({
          title: 'Orders',
          value: metrics?.data?.orders?.total ?? '—',
          subtitle: `Pending: ${pending}`,
          tone: pending > 0 ? 'warn' : 'good',
        }),
        this.renderMetricCard({
          title: 'Users',
          value: metrics?.data?.users?.total ?? '—',
          subtitle: `Admins: ${metrics?.data?.users?.admins ?? '—'}`,
          tone: 'neutral',
        }),
      ].join('');

      this.setMetricsStatus(`Last updated: ${new Date().toLocaleString()} • Server time: ${metrics?.data?.serverTime || '—'}`);
    } catch (e) {
      this.setMetricsStatus(
        e?.status === 401 || e?.status === 403
          ? 'Not authorized to view metrics. Please login with an admin account.'
          : `Failed to load metrics: ${e?.message || e}`,
        true
      );
      grid.innerHTML = this.renderMetricCard({
        title: 'Metrics',
        value: 'Error',
        subtitle: 'Check backend logs and ensure you are logged in as admin.',
        tone: 'bad',
      });
    }
  }

  static toggleAutoRefresh(enabled) {
    if (this._metricsRefreshTimer) {
      clearInterval(this._metricsRefreshTimer);
      this._metricsRefreshTimer = null;
    }

    if (enabled) {
      this._metricsRefreshTimer = setInterval(() => {
        // Only refresh if the admin dashboard is still mounted
        if (document.getElementById('admin-overview')) {
          this.refreshMetrics();
        }
      }, 30000);

      // Do an immediate refresh so it feels responsive
      this.refreshMetrics();
    }
  }

  static openDbSchemaViewer() {
    window.open('db-schema.html', '_blank');
  }

  /**
   * Switch between admin tabs
   */
  static switchTab(tabName, evt) {
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
    if (evt?.target) evt.target.classList.add('active');
  }

  /**
   * Load products and display in table
   */
  static async loadProducts() {
    try {
      const response = await apiService.getProducts({ limit: 100 });
      const products = Array.isArray(response) ? response : response.data || [];
      this._productsCache = products;

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
      // Apply any active filters to the rendered table
      this.renderProductsTableFromCache();
    } catch (error) {
      console.error('Error loading products:', error);
      document.getElementById('productsList').innerHTML = '<p class="error">Error loading products</p>';
    }
  }

  static setProductSearch(q) {
    this._productFilters.q = String(q || '').trim().toLowerCase();
    this.renderProductsTableFromCache();
  }

  static setLowStockOnly(checked) {
    this._productFilters.lowStockOnly = !!checked;
    this.renderProductsTableFromCache();
  }

  static renderProductsTableFromCache() {
    const productsList = document.getElementById('productsList');
    if (!productsList) return;
    const all = this._productsCache || [];

    const q = this._productFilters.q;
    const lowOnly = this._productFilters.lowStockOnly;
    const filtered = all.filter((p) => {
      const id = String(p._id || p.id || '');
      const name = String(p.name || '');
      const cat = String(p.category || '');
      const hay = `${id} ${name} ${cat}`.toLowerCase();
      if (q && !hay.includes(q)) return false;
      if (lowOnly && Number(p.stock || 0) > 5) return false;
      return true;
    });

    if (filtered.length === 0) {
      productsList.innerHTML = '<p>No products match your filters</p>';
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

    filtered.forEach(product => {
      const productId = product._id || product.id;
      const stock = Number(product.stock || 0);
      const stockHint = stock <= 5 ? ' style="color:#b00020;font-weight:700;"' : '';
      html += `
        <tr>
          <td>${productId}</td>
          <td>${product.name}</td>
          <td>$${Number(product.price || 0).toFixed(2)}</td>
          <td>
            <input type="number" value="${stock}" class="stock-input" ${stockHint}
              onchange="AdminManager.updateStock('${productId}', this.value)">
          </td>
          <td>${product.category}</td>
          <td>
            <button class="btn-edit" onclick="AdminManager.editProduct('${productId}')">Edit</button>
            <button class="btn-delete" onclick="AdminManager.deleteProduct('${productId}', '${String(product.name || '').replace(/'/g, "&#39;")}')">Delete</button>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    productsList.innerHTML = html;
  }

  /**
   * Load users and display in table
   */
  static async loadUsers() {
    try {
      // DB-backed admin endpoint
      const result = await apiService.request('/users/list', { method: 'GET' });
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
      const el = document.getElementById('usersList');
      if (el) {
        if (error?.status === 401 || error?.status === 403 || error?.code === 'UNAUTHENTICATED' || error?.code === 'FORBIDDEN') {
          el.innerHTML = '<p class="error">Not authorized. Please login with an admin account.</p>';
        } else {
          el.innerHTML = '<p class="error">Error loading users</p>';
        }
      }
    }
  }

  /**
   * Load orders and display in table
   */
  static async loadOrders() {
    try {
      // DB-backed admin endpoint
      const result = await apiService.request('/orders/all', { method: 'GET' });
      const orders = result.data || [];
      this._ordersCache = orders;

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
        const username = order?.user?.username || order?.user?.email || 'N/A';
        html += `
          <tr>
            <td>${order._id}</td>
            <td>${username}</td>
            <td>${UIUtils.formatPrice(order.totalAmount)}</td>
            <td>${itemCount}</td>
            <td><span class="status ${order.status}">${order.status}</span></td>
            <td>${orderDate}</td>
            <td>
              <button class="btn-edit" onclick="AdminManager.openOrderDetails('${order._id}')">View</button>
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
      const el = document.getElementById('ordersList');
      if (el) {
        if (error?.status === 401 || error?.status === 403 || error?.code === 'UNAUTHENTICATED' || error?.code === 'FORBIDDEN') {
          el.innerHTML = '<p class="error">Not authorized. Please login with an admin account.</p>';
        } else {
          el.innerHTML = '<p class="error">Error loading orders</p>';
        }
      }
    }
  }

  static openOrderDetails(orderId) {
    const order = (this._ordersCache || []).find((o) => String(o._id) === String(orderId));
    if (!order) {
      UIUtils.showNotification('Order not found', 'error');
      return;
    }

    const modal = document.getElementById('orderDetailsModal');
    const body = document.getElementById('orderDetailsBody');
    if (!modal || !body) return;

    const customer = order?.user?.username || order?.user?.email || 'N/A';
    const addr = order?.shippingAddress || {};
    const items = order?.items || [];

    body.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:16px;align-items:flex-start;">
        <div style="flex:1;min-width:260px;">
          <div style="margin-bottom:10px;"><strong>Order:</strong> ${order._id}</div>
          <div style="margin-bottom:10px;"><strong>Status:</strong> <span class="status ${order.status}">${order.status}</span></div>
          <div style="margin-bottom:10px;"><strong>Customer:</strong> ${customer}</div>
          <div style="margin-bottom:10px;"><strong>Payment:</strong> ${order.paymentMethod}</div>
          <div style="margin-bottom:10px;"><strong>Total:</strong> ${UIUtils.formatPrice(order.totalAmount)}</div>
          <div style="margin-bottom:10px;"><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
        </div>

        <div style="flex:1;min-width:260px;">
          <div style="font-weight:700;margin-bottom:8px;">Shipping Address</div>
          <div style="color:#555;line-height:1.5;">
            <div>${addr.street || ''}</div>
            <div>${[addr.city, addr.state, addr.zip].filter(Boolean).join(', ')}</div>
            <div>${addr.country || ''}</div>
          </div>
        </div>
      </div>

      <hr style="margin:14px 0;border:none;border-top:1px solid #eee;" />

      <div style="font-weight:700;margin-bottom:8px;">Items</div>
      <div style="overflow:auto;">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => {
              const name = it?.product?.name || it?.name || String(it?.product || '');
              const qty = Number(it?.quantity || 0);
              const price = Number(it?.price || 0);
              return `
                <tr>
                  <td>${name}</td>
                  <td>${qty}</td>
                  <td>${UIUtils.formatPrice(price)}</td>
                  <td>${UIUtils.formatPrice(price * qty)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end;margin-top:12px;">
        <button class="btn btn-secondary" type="button" onclick="AdminManager.archiveOrderReceipt('${order._id}')">Archive Receipt</button>
        <button class="btn" type="button" onclick="AdminManager.openReceiptPage('${order._id}')">Open Receipt</button>
      </div>
    `;

    modal.style.display = 'flex';
    modal.onclick = (e) => {
      if (e?.target === modal) this.closeOrderDetailsModal();
    };
  }

  static closeOrderDetailsModal() {
    const modal = document.getElementById('orderDetailsModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.onclick = null;
  }

  static async archiveOrderReceipt(orderId) {
    try {
      await apiService.request(`/orders/${orderId}/receipt/archive`, { method: 'POST' });
      UIUtils.showNotification('✅ Receipt archived', 'success');
    } catch (e) {
      UIUtils.showNotification(e?.message || 'Failed to archive receipt', 'error');
    }
  }

  static openReceiptPage(orderId) {
    window.open(`receipt.html?orderId=${encodeURIComponent(orderId)}`, '_blank');
  }

  /**
   * Load admin information
   */
  static loadAdminInfo() {
    (async () => {
      try {
        const me = await apiService.getUserProfile();
        if (!me) return;
        document.getElementById('adminUsername').textContent = me.username;
        document.getElementById('adminEmail').textContent = me.email;
      } catch (e) {
        console.error('Error loading admin info:', e);
      }
    })();
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
      await apiService.request('/products', {
        method: 'POST',
        body: JSON.stringify(productData),
      });

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
      await apiService.request(`/products/${productId}`, { method: 'DELETE' });

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
      await apiService.request(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ stock: parseInt(newStock) }),
      });

      UIUtils.showNotification('✅ Stock updated!', 'success');
    } catch (error) {
      console.error('Error updating stock:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
      this.loadProducts();
    }
  }

  /**
   * Edit product
   */
  static async editProduct(productId) {
    try {
      const cached = (this._productsCache || []).find((p) => String(p._id || p.id) === String(productId));
      let product = cached;

      // If not in cache (or cache missing fields), fetch latest
      if (!product) {
        const res = await apiService.request(`/products/${productId}`, { method: 'GET' });
        product = res?.data || res;
      }

      if (!product) {
        UIUtils.showNotification('Product not found', 'error');
        return;
      }

      this.openEditProductModal(product);
    } catch (error) {
      console.error('Error opening edit product:', error);
      UIUtils.showNotification(error?.message || 'Failed to load product', 'error');
    }
  }

  static openEditProductModal(product) {
    const modal = document.getElementById('editProductModal');
    if (!modal) return;

    document.getElementById('editProductId').value = product._id || product.id;
    document.getElementById('editProductName').value = product.name || '';
    document.getElementById('editProductPrice').value = Number(product.price || 0);
    document.getElementById('editProductCategory').value = product.category || '';
    document.getElementById('editProductDescription').value = product.description || '';
    document.getElementById('editProductImage').value = product.image || '';
    document.getElementById('editProductStock').value = Number(product.stock || 0);
    document.getElementById('editProductRating').value = Number(product.rating || 0);

    modal.style.display = 'block';
    // Close on backdrop click
    modal.onclick = (e) => {
      if (e?.target === modal) this.closeEditProductModal();
    };
  }

  static closeEditProductModal() {
    const modal = document.getElementById('editProductModal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.onclick = null;
  }

  static async submitEditProduct(event) {
    event.preventDefault();

    const productId = document.getElementById('editProductId').value;
    if (!productId) {
      UIUtils.showNotification('Missing product id', 'error');
      return;
    }

    const payload = {
      name: document.getElementById('editProductName').value?.trim(),
      price: parseFloat(document.getElementById('editProductPrice').value),
      category: document.getElementById('editProductCategory').value?.trim(),
      description: document.getElementById('editProductDescription').value?.trim(),
      image: document.getElementById('editProductImage').value?.trim(),
      stock: parseInt(document.getElementById('editProductStock').value),
      rating: parseFloat(document.getElementById('editProductRating').value) || 0,
    };

    if (!payload.name || !payload.category || !payload.description || !payload.image) {
      UIUtils.showNotification('Please fill out all required fields', 'info');
      return;
    }

    if (!Number.isFinite(payload.price) || payload.price < 0) {
      UIUtils.showNotification('Invalid price', 'error');
      return;
    }
    if (!Number.isFinite(payload.stock) || payload.stock < 0) {
      UIUtils.showNotification('Invalid stock', 'error');
      return;
    }

    try {
      await apiService.request(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      UIUtils.showNotification('✅ Product updated successfully!', 'success');
      this.closeEditProductModal();
      await this.loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
      UIUtils.showNotification(`❌ Error: ${error.message}`, 'error');
    }
  }

  /**
   * Update order status
   */
  static async updateOrderStatus(orderId, newStatus) {
    try {
      await apiService.request(`/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

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
      await apiService.request(`/users/${userId}/promote`, { method: 'PUT' });

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
      (async () => {
        try {
          await apiService.request('/users/logout', { method: 'POST' });
        } catch (e) {
          // ignore
        }
        window.location.href = 'account.html';
      })();
    }
  }
}

// Initialize admin manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  AdminManager.initialize();
});
