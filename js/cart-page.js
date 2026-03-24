/**
 * Cart Page Script
 * Handles displaying and managing shopping cart with database integration
 */

document.addEventListener('DOMContentLoaded', () => {
  apiService?.log?.('Cart page loaded');
  // Load cart from backend (Option B: requires login)
  cartManager.load().finally(() => {
    renderCart();
    updateCartCount();
  });
});

const _qtyTimers = new Map();

/**
 * Render cart items
 */
function renderCart() {
  const cartItems = cartManager.getItems();
  apiService?.log?.('Cart items:', cartItems);
  const tbody = document.querySelector('#cartTable tbody');
  
  if (cartItems.length === 0) {
    document.querySelector('.cart-page').innerHTML = `
      <div class="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Add items to your cart and they will appear here.</p>
        <a href="products.html" class="btn">Continue Shopping</a>
      </div>
    `;
    return;
  }
  
  tbody.innerHTML = cartItems
    .map(item => {
      const safeName = String(item.name || '');
      return `
        <tr>
          <td>
            <div class="cart-info">
              <img src="${item.image}" alt="${safeName}">
              <div>
                <p>${safeName}</p>
                <div class="cart-muted">Price: ${UIUtils.formatPrice(item.price)}</div>
              </div>
            </div>
          </td>
          <td>
            <input
              class="qty-input"
              type="number"
              min="1"
              step="1"
              inputmode="numeric"
              value="${item.quantity}"
              oninput="queueQuantityUpdate('${item.productId}', this.value)"
              onchange="queueQuantityUpdate('${item.productId}', this.value, true)"
              aria-label="Quantity for ${safeName}"
            >
          </td>
          <td>${UIUtils.formatPrice(item.price * item.quantity)}</td>
          <td>
            <button onclick="removeFromCart('${item.productId}')" class="btn btn-danger btn-sm" type="button">Remove</button>
          </td>
        </tr>
      `;
    })
    .join('');
  
  updateTotals();
}

// Debounced quantity update (prevents hammering API)
function queueQuantityUpdate(productId, quantity, immediate = false) {
  const qty = parseInt(quantity);
  if (!Number.isFinite(qty) || qty < 1) return;

  const prev = _qtyTimers.get(productId);
  if (prev) clearTimeout(prev);

  const delay = immediate ? 0 : 250;
  _qtyTimers.set(
    productId,
    setTimeout(() => {
      _qtyTimers.delete(productId);
      updateQuantity(productId, qty);
    }, delay)
  );
}

/**
 * Remove item from cart
 */
async function removeFromCart(productId) {
  try {
    await cartManager.removeItem(productId);
    UIUtils.showNotification('Item removed from cart', 'success');
  } catch (e) {
    UIUtils.showNotification(e.message || 'Failed to remove item', 'error');
  }
}

/**
 * Update item quantity
 */
async function updateQuantity(productId, quantity) {
  const qty = parseInt(quantity);
  if (!Number.isFinite(qty) || qty < 1) return;
  try {
    await cartManager.setItemQuantity(productId, qty);
  } catch (e) {
    UIUtils.showNotification(e.message || 'Failed to update quantity', 'error');
  }
}

/**
 * Clear entire cart
 */
async function clearCart() {
  if (cartManager.getItems().length === 0) {
    UIUtils.showNotification('Your cart is already empty', 'info');
    return;
  }

  const ok = confirm('Clear all items from your cart?');
  if (!ok) return;

  try {
    await cartManager.clearCart();
    UIUtils.showNotification('Cart cleared', 'success');
  } catch (e) {
    UIUtils.showNotification(e.message || 'Failed to clear cart', 'error');
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
  
  // Check if user is logged in (cookie auth) - option 3: toast only
  try {
    await apiService.requireLogin();
  } catch (e) {
    UIUtils.showNotification('Please login to proceed with checkout', 'info');
    return;
  }
  
  try {
    const paymentMethod = (document.querySelector('input[name="payment_method"]:checked')?.value || 'cod');
    const cartItems = cartManager.getItems();
    const subtotal = cartManager.getTotal();
    const tax = subtotal * 0.15;
    const totalAmount = subtotal + tax;
    
    // Load saved shipping address from backend
    let savedAddress = null;
    try {
      savedAddress = await apiService.getAddress();
    } catch (e) {
      savedAddress = null;
    }

    // Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        product: item.productId, // Server cart already normalizes productId
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
      paymentMethod,
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
  await cartManager.clearCart();
      
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
