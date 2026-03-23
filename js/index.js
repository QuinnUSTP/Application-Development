/**
 * Index Page Script
 * Handles loading featured products and categories on homepage
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Wait a bit for backend detection to complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await loadCategories();
  await loadFeaturedProducts();
  await loadLatestProducts();
  updateCartCount();
});

// Keep a local cache so the homepage can add-to-cart without an extra round-trip
// and so it works for MongoDB string _id values too.
let featuredProductsCache = [];
let latestProductsCache = [];

/**
 * Load categories from API
 */
async function loadCategories() {
  try {
    const response = await apiService.getCategories();
    
    // Handle both array and object responses
    let categories = [];
    if (Array.isArray(response)) {
      categories = response;
    } else if (response && response.data) {
      categories = response.data;
    }
    
    const container = document.getElementById('categoriesContainer');
    
    if (categories.length === 0) {
      console.warn('No categories found');
      container.innerHTML = '<p>No categories available</p>';
      return;
    }
    
    container.innerHTML = categories
      .map(category => `
        <div class="col-3">
          <a href="products.html?category=${category.id}">
            <img src="${category.image}" alt="${category.name}">
          </a>
        </div>
      `)
      .join('');
  } catch (error) {
    console.error('Error loading categories:', error);
  }
}

/**
 * Load featured products from API
 */
async function loadFeaturedProducts() {
  try {
    const response = await apiService.getProducts({ limit: 4 });
    
    // Handle both array and object responses
    let products = [];
    if (Array.isArray(response)) {
      products = response;
    } else if (response && response.data) {
      products = response.data;
    }

    featuredProductsCache = products;
    const container = document.getElementById('featuredProducts');
    
    if (products.length === 0) {
      console.warn('No products found');
      container.innerHTML = '<p>No products available</p>';
      return;
    }
    
    container.innerHTML = products
      .map(product => UIUtils.renderProductCard(product, { showAddToCart: false }))
      .join('');
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('featuredProducts').innerHTML = '<p>Error loading products</p>';
  }
}

/**
 * Load latest products from API
 */
async function loadLatestProducts() {
  try {
    const response = await apiService.getProducts({ limit: 8 });
    
    // Handle both array and object responses
    let products = [];
    if (Array.isArray(response)) {
      products = response;
    } else if (response && response.data) {
      products = response.data;
    }

    latestProductsCache = products;
    const container = document.getElementById('latestProducts');
    
    if (products.length === 0) {
      console.warn('No products found');
      container.innerHTML = '<p>No products available</p>';
      return;
    }
    
    container.innerHTML = products
      .map(product => UIUtils.renderProductCard(product, { showAddToCart: false }))
      .join('');
  } catch (error) {
    console.error('Error loading latest products:', error);
    document.getElementById('latestProducts').innerHTML = '<p>Error loading products</p>';
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
