/**
 * Index Page Script
 * Handles loading featured products and categories on homepage
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded - Starting to load categories and products');
  
  // Wait a bit for backend detection to complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await loadCategories();
  await loadFeaturedProducts();
  await loadLatestProducts();
  updateCartCount();
});

/**
 * Load categories from API
 */
async function loadCategories() {
  try {
    console.log('Loading categories...');
    const response = await apiService.getCategories();
    console.log('Categories response:', response);
    
    // Handle both array and object responses
    let categories = [];
    if (Array.isArray(response)) {
      categories = response;
    } else if (response && response.data) {
      categories = response.data;
    }
    
    console.log('Categories loaded:', categories);
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
    console.log('Loading featured products...');
    const response = await apiService.getProducts({ limit: 4 });
    console.log('Products response:', response);
    
    // Handle both array and object responses
    let products = [];
    if (Array.isArray(response)) {
      products = response;
    } else if (response && response.data) {
      products = response.data;
    }
    
    console.log('Products loaded:', products);
    const container = document.getElementById('featuredProducts');
    
    if (products.length === 0) {
      console.warn('No products found');
      container.innerHTML = '<p>No products available</p>';
      return;
    }
    
    container.innerHTML = products
      .map(product => UIUtils.renderProductCard(product))
      .join('');
    
    // Attach event listeners to "Add to Cart" buttons
    attachAddToCartListeners();
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
    console.log('Loading latest products...');
    const response = await apiService.getProducts({ limit: 8 });
    console.log('Latest products response:', response);
    
    // Handle both array and object responses
    let products = [];
    if (Array.isArray(response)) {
      products = response;
    } else if (response && response.data) {
      products = response.data;
    }
    
    console.log('Latest products loaded:', products);
    const container = document.getElementById('latestProducts');
    
    if (products.length === 0) {
      console.warn('No products found');
      container.innerHTML = '<p>No products available</p>';
      return;
    }
    
    container.innerHTML = products
      .map(product => UIUtils.renderProductCard(product))
      .join('');
    
    // Attach event listeners to "Add to Cart" buttons
    attachAddToCartListeners();
  } catch (error) {
    console.error('Error loading latest products:', error);
    document.getElementById('latestProducts').innerHTML = '<p>Error loading products</p>';
  }
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
  const product = await apiService.getProduct(productId);
  
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
