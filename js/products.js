/**
 * Products Page Script
 * Handles loading and displaying all products with filtering and sorting
 */

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let currentSort = 'default';
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Products page loaded');
  // Show loading state immediately
  const container = document.getElementById('productsContainer');
  if (container) {
    container.innerHTML = '<p style="text-align: center; color: #999;">Loading products...</p>';
  }
  await loadProducts();
  updateCartCount();
});

/**
 * Load products from API
 */
async function loadProducts() {
  try {
    console.log('Loading all products...');
    const filters = {
      sortBy: currentSort === 'default' ? 'newest' : currentSort,
    };
    
    const response = await apiService.getProducts(filters);
    console.log('API Response:', response);
    
    // Handle both array response and object response from backend
    if (Array.isArray(response)) {
      allProducts = response;
    } else if (response && response.data) {
      allProducts = response.data; // Backend returns {success, data, total, pages}
    } else {
      allProducts = [];
    }
    
    console.log('Loaded products:', allProducts);
    
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
  
  // Create rows with 4 products per row
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
  const productId = parseInt(event.target.dataset.productId);
  const product = allProducts.find(p => p.id === productId);
  
  if (product) {
    cartManager.addItem(product, 1);
    updateCartCount();
    UIUtils.showNotification(`${product.name} added to cart!`, 'success');
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
cartManager.subscribe((event, data) => {
  if (event === 'cart-updated') {
    updateCartCount();
  }
});
