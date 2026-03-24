/**
 * Receipt Page Script
 * Displays order receipt with product details
 */

document.addEventListener('DOMContentLoaded', async () => {
  apiService?.log?.('Receipt page loaded');
  await loadReceipt();
  updateCartCount();
});

/**
 * Load receipt from backend
 */
async function loadReceipt() {
  try {
    // Get order ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
      showError('No order ID provided');
      return;
    }
    
  apiService?.log?.('🧾 Loading receipt for order:', orderId);
    
    // Check if user is logged in (cookie auth). Also provides customer info.
    const me = await apiService.getUserProfile();
    
    // Fetch order from backend
    const order = await apiService.getOrder(orderId);
    
    if (!order) {
      showError('Order not found');
      return;
    }
    
  apiService?.log?.('✅ Receipt loaded:', order);
    renderReceipt(order, me);
  } catch (error) {
    console.error('Error loading receipt:', error);
    showError(error.message || 'Failed to load receipt');
  }
}

/**
 * Render receipt HTML
 */
function renderReceipt(order, user) {
  const receiptContent = document.getElementById('receiptContent');
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  
  let itemsHtml = '';
  let itemTotal = 0;
  
  if (order.items && order.items.length > 0) {
    itemsHtml = order.items.map(item => {
      const productName = item?.product?.name || item?.name || item?.product || 'Product';
      const price = item.price;
      const quantity = item.quantity;
      const subtotal = price * quantity;
      itemTotal += subtotal;
      
      return `
        <tr>
          <td>${productName}</td>
          <td>${quantity}</td>
          <td>${UIUtils.formatPrice(price)}</td>
          <td>${UIUtils.formatPrice(subtotal)}</td>
        </tr>
      `;
    }).join('');
  }
  
  const tax = order.totalAmount * 0.15;
  const subtotal = order.totalAmount - tax;
  
  receiptContent.innerHTML = `
    <div class="receipt-container">
      <div class="receipt-header">
        <h1><i class="fa fa-check-circle"></i> ORDER CONFIRMED</h1>
        <div class="success-message">Thank you for your purchase!</div>
        <div class="order-number">
          <strong>Order ID:</strong> ${order._id}<br>
          <strong>Order Date:</strong> ${orderDate}<br>
          <strong>Status:</strong> <span style="color: #4CAF50; font-weight: bold;">${order.status.toUpperCase()}</span>
        </div>
      </div>

      <div class="receipt-section">
        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${user?.username || 'N/A'}</p>
        <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
      </div>

      <div class="receipt-section">
        <h3>Order Items</h3>
        <table class="receipt-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <div class="receipt-total">
        <div class="total-info">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${UIUtils.formatPrice(subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Tax (15%):</span>
            <span>${UIUtils.formatPrice(tax)}</span>
          </div>
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>${UIUtils.formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div class="receipt-section">
        <h3>Shipping Address</h3>
        <p>
          ${order.shippingAddress?.street || 'N/A'}<br>
          ${order.shippingAddress?.city || ''} ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zip || ''}<br>
          ${order.shippingAddress?.country || 'N/A'}
        </p>
      </div>

      <div class="receipt-section">
        <h3>Payment Method</h3>
        <p>${order.paymentMethod ? order.paymentMethod.replace('_', ' ').toUpperCase() : 'N/A'}</p>
      </div>

      <div class="action-buttons">
        <button class="btn" onclick="window.print();" style="background-color: #007bff;">
          <i class="fa fa-print"></i> Print Receipt
        </button>
        <a href="products.html" class="btn">Continue Shopping</a>
      </div>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  const receiptContent = document.getElementById('receiptContent');
  receiptContent.innerHTML = `
    <div class="receipt-container" style="text-align: center;">
      <h2 style="color: #dc3545;"><i class="fa fa-exclamation-circle"></i> Error</h2>
      <p>${message}</p>
      <div class="action-buttons">
        <a href="index.html" class="btn">Back to Home</a>
        <a href="account.html" class="btn">Login</a>
      </div>
    </div>
  `;
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
