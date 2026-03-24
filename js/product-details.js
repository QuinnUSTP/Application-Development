/**
 * Product Details Page Script
 * Loads and displays single product with full details
 */

let currentProduct = null;

document.addEventListener('DOMContentLoaded', async () => {
  apiService?.log?.('Product details page loaded');
  await loadProductDetails();
  // Option B: load server cart so cart count and add-to-cart use fresh state
  cartManager.load().finally(() => updateCartCount());
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
    
  apiService?.log?.('🛍️ Loading product:', productId);
    
    // Fetch product from API
    const product = await apiService.getProduct(productId);
    
    if (!product) {
      console.warn('Product not found with ID:', productId);
      apiService?.log?.('Trying to load all products and find by ID...');
      
      // Fallback: try to load all products and find the one with matching ID
      const allProducts = await apiService.getProducts();
      const foundProduct = allProducts.find(p => 
        p.id == productId || 
        p._id === productId ||
        String(p.id) === String(productId)
      );
      
      if (foundProduct) {
        currentProduct = foundProduct;
        apiService?.log?.('✅ Product found in all products list:', foundProduct);
        renderProductDetails(foundProduct);
        return;
      }
      
      showError('Product not found');
      return;
    }
    
    currentProduct = product;
  apiService?.log?.('✅ Product loaded:', product);
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
  setPrimaryImage(product);
  setGalleryForProduct(product);
  setProductInfo(product);
  loadRelatedProducts(product);
}

/**
 * Load and render related products
 * - Prefer same category
 * - Exclude current product
 * - Render up to 4 items
 */
async function loadRelatedProducts(product) {
  const relatedContainer = document.getElementById('relatedProducts');
  if (!relatedContainer) return;

  try {
    const response = await apiService.getProducts();
    const products = Array.isArray(response) ? response : (response?.data || []);

    const currentId = String(product._id || product.id);
    const category = product.category;

    const sameCategory = products.filter(p =>
      String(p._id || p.id) !== currentId &&
      (category ? String(p.category) === String(category) : true)
    );

    const otherCategory = products.filter(p =>
      String(p._id || p.id) !== currentId &&
      (category ? String(p.category) !== String(category) : true)
    );

    // Fill up to 4: prefer same category, then top up from others.
    const related = [...sameCategory.slice(0, 4)];
    if (related.length < 4) {
      related.push(...otherCategory.slice(0, 4 - related.length));
    }

    if (related.length === 0) {
      relatedContainer.innerHTML = '';
      return;
    }

    // Keep the same visual grid; cards include clickable image + name.
    relatedContainer.innerHTML = related.map(p => UIUtils.renderProductCard(p)).join('');
  } catch (e) {
    console.error('Error loading related products:', e);
  }
}

function isRedPrintedTShirt(product) {
  const text = `${product.name || ''} ${product.title || ''}`.toLowerCase();
  return text.includes('red printed t-shirt');
}

function setPrimaryImage(product) {
  const productImg = document.getElementById('ProductImg');
  if (!productImg) return;

  productImg.src = isRedPrintedTShirt(product)
    ? 'images/gallery-1.jpg'
    : (product.image || 'images/image-placeholder.png');
  productImg.alt = product.name || 'Product image';
}

function setGalleryForProduct(product) {
  const gallery = document.querySelector('.small-img-row');
  if (!gallery) return;

  if (isRedPrintedTShirt(product)) {
    gallery.style.display = '';
    gallery.innerHTML = `
      <div class="small-img-col">
        <img src="images/gallery-1.jpg" width="100%" class="small-img">
      </div>
      <div class="small-img-col">
        <img src="images/gallery-2.jpg" width="100%" class="small-img">
      </div>
      <div class="small-img-col">
        <img src="images/gallery-3.jpg" width="100%" class="small-img">
      </div>
      <div class="small-img-col">
        <img src="images/gallery-4.jpg" width="100%" class="small-img">
      </div>
    `;

    bindGalleryClicks();
  } else {
    gallery.style.display = 'none';
    gallery.innerHTML = '';
  }
}

function setProductInfo(product) {
  const productCol = document.querySelector('.col-2:last-of-type');
  if (!productCol) return;

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

function bindGalleryClicks() {
  const productImg = document.getElementById('ProductImg');
  const smallImgs = document.getElementsByClassName('small-img');

  for (let i = 0; i < smallImgs.length; i++) {
    smallImgs[i].onclick = function() {
      if (productImg) {
        productImg.src = smallImgs[i].src;
      }
    };
  }
}

/**
 * Add product to cart
 */
async function addToCart() {
  if (!currentProduct) {
    UIUtils.showNotification('Product not found', 'error');
    return;
  }

  // Option B: cart requires login
  try {
    await apiService.requireLogin();
  } catch (e) {
    UIUtils.showNotification('Please login to add items to your cart', 'info');
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
    cartId: String(currentProduct._id || currentProduct.id), // stable cart key
  };
  
  // Add to cart (server-backed)
  cartManager
    .addItem(cartProduct, quantity)
    .then(() => {
      updateCartCount();
      UIUtils.showNotification(`${currentProduct.name} added to cart!`, 'success');
      quantityInput.value = 1;
    })
    .catch((e) => {
      UIUtils.showNotification(e?.message || 'Failed to add item to cart', 'error');
    });
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
    cartCount.textContent = cartManager.getItemCount();
  }
}
