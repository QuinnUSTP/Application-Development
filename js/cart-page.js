/**
 * Cart Page Script
 * Handles displaying and managing shopping cart with database integration
 */

document.addEventListener('DOMContentLoaded', () => {
  apiService?.log?.('Cart page loaded');
  renderCart();
  updateCartCount();
});

/**
 * Render cart items
 */
function renderCart() {
  const cartItems = cartManager.getItems();
  apiService?.log?.('Cart items:', cartItems);
  const tbody = document.querySelector('#cartTable tbody');
  
  if (cartItems.length === 0) {
    document.querySelector('.cart-page').innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <h2>Your cart is empty</h2>
        <p>Add items to your cart and they will appear here.</p>
        <a href="products.html" class="btn">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  tbody.innerHTML = cartItems
    .map(item => `
      <tr>
        <td>
          <div class="cart-info">
            <img src="${item.image}" alt="${item.name}" width="60">
            <div>
              <p>${item.name}</p>
              <small>Price: ${UIUtils.formatPrice(item.price)}</small>
            </div>
          </div>
        </td>
        <td><input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${item.id}, this.value)"></td>
        <td>${UIUtils.formatPrice(item.price * item.quantity)}</td>
        <td>
          <button onclick="removeFromCart(${item.id})" class="btn" style="background-color: #dc3545; padding: 5px 10px; font-size: 12px;">Remove</button>
        </td>
      </tr>
    `)
    .join('');
  
  updateTotals();
}

/**
 * Remove item from cart
 */
function removeFromCart(productId) {
  cartManager.removeItem(productId);
  renderCart();
  updateCartCount();
  UIUtils.showNotification('Item removed from cart', 'success');
}

/**
 * Update item quantity
 */
function updateQuantity(productId, quantity) {
  const qty = parseInt(quantity);
  if (qty > 0) {
    cartManager.updateQuantity(productId, qty);
    renderCart();
    updateCartCount();
  }
}

/**
 * Update cart totals
 */
function updateTotals() {
  const total = cartManager.getTotal();
  const tax = total * 0.15; // 15% tax
  const grandTotal = total + tax;
  
  document.getElementById('subtotal').textContent = UIUtils.formatPrice(total);
  document.getElementById('tax').textContent = UIUtils.formatPrice(tax);
  document.getElementById('total').textContent = UIUtils.formatPrice(grandTotal);
}

/**
 * Checkout - Create order in database
 */
async function checkout() {
  if (cartManager.getItems().length === 0) {
    UIUtils.showNotification('Your cart is empty', 'error');
    return;
  }
  
  // Check if user is logged in
  if (!apiService.getStoredToken()) {
    UIUtils.showNotification('Please login to proceed with checkout', 'info');
    setTimeout(() => {
      window.location.href = 'account.html';
    }, 1500);
    return;
  }
  
  try {
    const cartItems = cartManager.getItems();
    const subtotal = cartManager.getTotal();
    const tax = subtotal * 0.15;
    const totalAmount = subtotal + tax;
    
    // Load saved shipping address (from Account page)
    let savedAddress = null;
    try {
      savedAddress = JSON.parse(localStorage.getItem('redstore_address'));
    } catch (e) {
      savedAddress = null;
    }

    // Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        product: item.cartId || item._id || item.id, // Use MongoDB _id for backend lookup
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount: totalAmount,
      shippingAddress: {
        street: savedAddress?.street || 'To be entered',
        city: savedAddress?.city || 'To be entered',
        state: savedAddress?.state || 'To be entered',
        zip: savedAddress?.zip || 'To be entered',
        country: savedAddress?.country || 'To be entered',
      },
      paymentMethod: 'credit_card',
    };
    
  apiService?.log?.('📦 Creating order:', orderData);
    
    // Create order in database
    const order = await apiService.createOrder(orderData);
    
    if (order && order._id) {
      apiService?.log?.('✅ Order created successfully:', order._id);

      // Best-effort: archive receipt JSON on the server (writes to Appdev/Receipts)
      try {
        await apiService.request(`/orders/${order._id}/receipt/archive`, { method: 'POST' });
      } catch (e) {
        console.warn('⚠️ Receipt archive failed (continuing):', e?.message);
      }
      
      // Clear cart
      cartManager.clearCart();
      updateCartCount();
      
      // Show success and redirect to receipt
      UIUtils.showNotification('Order placed successfully!', 'success');
      setTimeout(() => {
        window.location.href = `receipt.html?orderId=${order._id}`;
      }, 1500);
    }
  } catch (error) {
    console.error('❌ Checkout error:', error);
    UIUtils.showNotification(error.message || 'Checkout failed', 'error');
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
    renderCart();
    updateCartCount();
  }
});
