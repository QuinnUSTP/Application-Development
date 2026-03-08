/**
 * Product Details Page Script
 * Loads and displays single product with full details
 */

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Product details page loaded');
  await loadProductDetails();
  updateCartCount();
});

/**
 * Load product details from API
 */
async function loadProductDetails() {
  try {
    // Get product ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
      showError('No product ID provided');
      return;
    }
    
    console.log('🛍️ Loading product:', productId);
    
    // Fetch product from API
    const product = await apiService.getProduct(productId);
    
    if (!product) {
      console.warn('Product not found with ID:', productId);
      console.log('Trying to load all products and find by ID...');
      
      // Fallback: try to load all products and find the one with matching ID
      const allProducts = await apiService.getProducts();
      const foundProduct = allProducts.find(p => 
        p.id == productId || 
        p._id === productId ||
        String(p.id) === String(productId)
      );
      
      if (foundProduct) {
        currentProduct = foundProduct;
        console.log('✅ Product found in all products list:', foundProduct);
        renderProductDetails(foundProduct);
        return;
      }
      
      showError('Product not found');
      return;
    }
    
    currentProduct = product;
    console.log('✅ Product loaded:', product);
    renderProductDetails(product);
  } catch (error) {
    console.error('Error loading product:', error);
    showError(error.message || 'Failed to load product');
  }
}

/**
 * Render product details
 */
function renderProductDetails(product) {
  // Update title
  document.title = `${product.name} - RedStore`;
  
  // Update main image
  const productImg = document.getElementById('ProductImg');
  if (productImg) {
    productImg.src = product.image;
    productImg.alt = product.name;
  }
  
  // Update product info
  const productCol = document.querySelector('.col-2:last-of-type');
  if (productCol) {
    const stars = UIUtils.renderStars(product.rating);
    
    productCol.innerHTML = `
      <p>Home / ${product.category}</p>
      <h1>${product.name}</h1>
      <h4>${UIUtils.formatPrice(product.price)}</h4>
      <div class="rating">
        ${stars}
        <span>(${product.rating} / 5)</span>
      </div>
      <div style="margin: 20px 0;">
        <label>Quantity:</label>
        <input type="number" id="quantityInput" value="1" min="1" max="${product.stock}">
        <span style="margin-left: 10px; color: ${product.stock > 0 ? '#4CAF50' : '#dc3545'};">
          ${product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </span>
      </div>
      <button class="btn" onclick="addToCart()" ${product.stock === 0 ? 'disabled' : ''}>
        Add To Cart
      </button>
      <h3>Product Details <i class="fa fa-indent"></i></h3>
      <br>
      <p>${product.description}</p>
    `;
  }
}

/**
 * Add product to cart
 */
function addToCart() {
  if (!currentProduct) {
    UIUtils.showNotification('Product not found', 'error');
    return;
  }
  
  const quantityInput = document.getElementById('quantityInput');
  const quantity = parseInt(quantityInput.value) || 1;
  
  if (quantity < 1 || quantity > currentProduct.stock) {
    UIUtils.showNotification('Invalid quantity', 'error');
    return;
  }
  
  // Prepare product data for cart (include _id for backend)
  const cartProduct = {
    ...currentProduct,
    cartId: currentProduct._id || currentProduct.id, // Use MongoDB _id if available, fallback to id
  };
  
  // Add to cart
  cartManager.addItem(cartProduct, quantity);
  updateCartCount();
  
  UIUtils.showNotification(`${currentProduct.name} added to cart!`, 'success');
  
  // Reset quantity
  quantityInput.value = 1;
}

/**
 * Show error message
 */
function showError(message) {
  const productCol = document.querySelector('.col-2:last-of-type');
  if (productCol) {
    productCol.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2 style="color: #dc3545;"><i class="fa fa-exclamation-circle"></i></h2>
        <p>${message}</p>
        <a href="products.html" class="btn">Back to Products</a>
      </div>
    `;
  }
}

/**
 * Update cart count in navbar
 */
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    const items = cartManager.getItems();
    cartCount.textContent = items.length;
  }
}
