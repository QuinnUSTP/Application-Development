(() => {
  function getOrderId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
  }

  async function getArchivedReceipt(orderId) {
    if (!apiService?.getStoredToken?.()) {
      throw new Error('Not authenticated');
    }

    // Refresh token in memory
    apiService.setToken(apiService.getStoredToken());
    const res = await fetch(`${apiService.baseUrl}/orders/${orderId}/receipt`, {
      method: 'GET',
      headers: apiService.getAuthHeaders(),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(json?.message || `Failed to fetch receipt (HTTP ${res.status})`);
    }
    return json?.data;
  }

  function formatAddress(address) {
    if (!address) return '<span style="opacity:0.7;">(none)</span>';
    const lines = [
      address.name,
      address.street,
      `${address.city || ''}${address.city && address.state ? ', ' : ''}${address.state || ''} ${address.zip || ''}`.trim(),
      address.country,
    ].filter(Boolean);
    return lines.map(l => `<div>${l}</div>`).join('');
  }

  function renderReceipt(root, receipt) {
    const items = Array.isArray(receipt?.items) ? receipt.items : [];
    const total = Number(receipt?.totalAmount || 0);
    const created = receipt?.createdAt ? new Date(receipt.createdAt) : null;

    root.innerHTML = `
      <div class="row" style="align-items:flex-start;">
        <div class="col-2" style="flex: 1 1 650px;">
          <h2 style="margin-bottom: 10px;">Order Details</h2>
          <p style="margin-bottom: 18px; opacity: 0.8;">Order #${String(receipt?.orderId || '').substring(0, 8)}</p>

          <div class="cart-page" style="margin: 0;">
            <table style="width: 100%;">
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
              ${items.map(it => {
                const name = it?.name || 'Product';
                const qty = Number(it?.quantity || 0);
                const price = Number(it?.price || 0);
                return `
                  <tr>
                    <td>${name}</td>
                    <td>${qty}</td>
                    <td>${UIUtils.formatPrice(price * qty)}</td>
                  </tr>
                `;
              }).join('')}
            </table>
          </div>

          <div style="margin-top: 18px; display:flex; justify-content:space-between; flex-wrap:wrap; gap: 10px;">
            <div style="opacity:0.85;">Status: <strong>${receipt?.status || 'placed'}</strong></div>
            <div style="opacity:0.85;">Date: <strong>${created ? created.toLocaleString() : '—'}</strong></div>
            <div style="opacity:0.85;">Total: <strong>${UIUtils.formatPrice(total)}</strong></div>
          </div>

          <div style="margin-top: 18px;">
            <a class="btn" href="account.html" style="display:inline-block;">Back to Account</a>
            <a class="btn" href="receipt.html?id=${encodeURIComponent(receipt?.orderId || '')}" style="display:inline-block; margin-left: 10px;">Open Receipt</a>
          </div>
        </div>

        <div class="col-2" style="flex: 1 1 300px;">
          <div style="background:#fff; padding: 16px; border-radius: 10px; box-shadow: 0 0 20px 0px rgba(0,0,0,0.08);">
            <h3 style="margin-bottom: 10px;">Shipping Address</h3>
            <div style="line-height:1.6;">
              ${formatAddress(receipt?.shippingAddress)}
            </div>
            <hr style="margin: 14px 0;" />
            <div style="opacity:0.9;">
              <div><strong>Archived file:</strong> Yes</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async function init() {
    const root = document.getElementById('orderDetailsRoot');
    const orderId = getOrderId();

    if (!orderId) {
      root.innerHTML = `<div class="empty-state">Missing order id.</div>`;
      return;
    }

    if (!apiService?.getStoredToken?.()) {
      root.innerHTML = `
        <div class="empty-state">
          <p>You need to login to view this order.</p>
          <a href="account.html" class="btn" style="margin-top: 18px; display:inline-block;">Go to Account</a>
        </div>
      `;
      return;
    }

    try {
      const receipt = await getArchivedReceipt(orderId);
      renderReceipt(root, receipt);
    } catch (e) {
      // Fallback: show the existing receipt page which loads live order data
      console.warn('Falling back to receipt.html:', e?.message);
      window.location.href = `receipt.html?id=${encodeURIComponent(orderId)}`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
