/**
 * Products Page Script
 * Handles loading and displaying all products with filtering and sorting
 */

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentSort = 'default';
let allProducts = [];

function showProductsFatal(message, details) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  const safeMsg = String(message || 'Something went wrong while loading products.');
  const safeDetails = details ? String(details) : '';

  container.innerHTML = `
    <div style="max-width:900px;margin:20px auto;padding:16px;border:1px solid #ffd1cc;background:#fff6f5;border-radius:10px;">
      <h3 style="margin:0 0 8px;color:#b00020;">Products couldn't load</h3>
      <p style="margin:0 0 10px;color:#555;">${safeMsg}</p>
      ${safeDetails ? `<pre style="white-space:pre-wrap;margin:0 0 12px;padding:10px;border-radius:8px;background:#fff;border:1px solid #eee;max-height:180px;overflow:auto;">${safeDetails}</pre>` : ''}
      <button class="btn" type="button" onclick="window.location.reload()" style="margin:0;">Retry</button>
      <a href="index.html" class="btn btn-outline" style="margin:0 0 0 10px;">Go Home</a>
    </div>
  `;
}

// Fail loudly instead of leaving a blank/white screen
window.addEventListener('error', (evt) => {
  try {
    console.error('[products.js] window error:', evt?.error || evt);
    showProductsFatal('A script error occurred. Please retry.', evt?.error?.stack || evt?.message);
  } catch (_) {}
});

window.addEventListener('unhandledrejection', (evt) => {
  try {
    console.error('[products.js] unhandled rejection:', evt?.reason || evt);
    showProductsFatal('A network/API error occurred. Please retry.', evt?.reason?.stack || evt?.reason?.message || String(evt?.reason || ''));
  } catch (_) {}
});

document.addEventListener('DOMContentLoaded', async () => {
  apiService?.log?.('Products page loaded');
  // Hard fail fast in case core scripts didn't load (prevents "loads then nothing").
  if (!window.apiService || !window.UIUtils || !window.cartManager) {
    const missing = [
      !window.apiService ? 'apiService' : null,
      !window.UIUtils ? 'UIUtils' : null,
      !window.cartManager ? 'cartManager' : null,
    ].filter(Boolean);

    const container = document.getElementById('productsContainer');
    if (container) {
      container.innerHTML = `<p style="color:#f44336;text-align:center;">Missing required scripts: ${missing.join(', ')}. Hard refresh (Ctrl+F5) and check Console for errors.</p>`;
    }
    console.error('[products.js] Missing required globals:', missing);
    return;
  }

  // Show loading state immediately
  const container = document.getElementById('productsContainer');
  if (container) {
    container.innerHTML = '<p style="text-align: center; color: #999;">Loading products...</p>';
  }
  // Ensure cart is loaded from backend (Option B)
  cartManager.load().finally(() => updateCartCount());
  try {
    await loadProducts();
    updateCartCount();
  } catch (e) {
    showProductsFatal(e?.message || 'Failed to load products', e?.stack);
  }
});

/**
 * Load products from API
 */
async function loadProducts() {
  try {
    apiService?.log?.('Loading all products...');
    const filters = {
      sortBy: currentSort === 'default' ? 'newest' : currentSort,
    };
    
    const response = await apiService.getProducts(filters);
    apiService?.log?.('API Response:', response);
    
    // Handle both array response and object response from backend
    if (Array.isArray(response)) {
      allProducts = response;
    } else if (response && response.data) {
      allProducts = response.data; // Backend returns {success, data, total, pages}
    } else {
      allProducts = [];
    }
    
  apiService?.log?.('Loaded products:', allProducts);
    
    if (allProducts.length === 0) {
      console.warn('No products loaded from API');
    }
    
    renderProducts(currentPage);
    renderPagination();
    updateCartCount();
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('productsContainer').innerHTML = '<p>Error loading products. Check console for details.</p>';
  }
}

/**
 * Render products for current page in a grid layout (4 per row)
 */
function renderProducts(page) {
  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageProducts = allProducts.slice(start, end);
  
  const container = document.getElementById('productsContainer');
  
  if (pageProducts.length === 0) {
    container.innerHTML = '<p>No products found</p>';
    return;
  }
  
  // Create rows with 4 products per row (matches `.col-4` = 25%)
  let html = '';
  for (let i = 0; i < pageProducts.length; i += 4) {
    html += '<div class="row">';
    for (let j = 0; j < 4 && i + j < pageProducts.length; j++) {
      html += UIUtils.renderProductCard(pageProducts[i + j]);
    }
    html += '</div>';
  }
  
  container.innerHTML = html;
  attachAddToCartListeners();
}

/**
 * Render pagination buttons
 */
function renderPagination() {
  const totalPages = Math.ceil(allProducts.length / ITEMS_PER_PAGE);
  const pagination = document.getElementById('pagination');
  
  let paginationHtml = '';
  
  // Add previous button
  if (currentPage > 1) {
    paginationHtml += `<span onclick="goToPage(${currentPage - 1})" style="cursor: pointer;">&#8592;</span>`;
  }
  
  // Add page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHtml += `<span style="background: #ff523b; color: white; cursor: default;">${i}</span>`;
    } else {
      paginationHtml += `<span onclick="goToPage(${i})" style="cursor: pointer;">${i}</span>`;
    }
  }
  
  // Add next button
  if (currentPage < totalPages) {
    paginationHtml += `<span onclick="goToPage(${currentPage + 1})" style="cursor: pointer;">&#8594;</span>`;
  }
  
  pagination.innerHTML = paginationHtml;
}

/**
 * Navigate to page
 */
function goToPage(page) {
  currentPage = page;
  renderProducts(currentPage);
  renderPagination();
  window.scrollTo(0, 0);
}

/**
 * Handle sorting
 */
async function handleSort() {
  const sortSelect = document.getElementById('sortSelect');
  currentSort = sortSelect.value;
  currentPage = 1;
  await loadProducts();
}

/**
 * Attach click listeners to add to cart buttons
 */
function attachAddToCartListeners() {
  document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', handleAddToCart);
  });
}

/**
 * Handle adding product to cart
 */
async function handleAddToCart(event) {
  event.preventDefault();
  const productId = event.currentTarget.dataset.productId;
  const product = allProducts.find(p => String(p.id) === String(productId) || String(p._id) === String(productId));
  
  if (product) {
    try {
      await cartManager.addItem(product, 1);
      updateCartCount();
      UIUtils.showNotification(`${product.name} added to cart!`, 'success');
    } catch (e) {
      const msg = e?.message || 'Failed to add item to cart';
      UIUtils.showNotification(msg, 'error');
    }
  }
}

/**
 * Update cart count display
 */
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cartManager.getItemCount();
  }
}

// Subscribe to cart changes
let _cartCountRaf = null;
cartManager.subscribe((event, data) => {
  if (event !== 'cart-updated') return;

  // IMPORTANT: don't call cartManager.load() here.
  // load() emits cart-updated, which would recurse and can freeze the page.
  // We only need the count updated from the in-memory cart.
  if (_cartCountRaf) cancelAnimationFrame(_cartCountRaf);
  _cartCountRaf = requestAnimationFrame(() => {
    _cartCountRaf = null;
    updateCartCount();
  });
});
