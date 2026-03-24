/*
  Smoke: checkout via DB cart + payment method (no external deps).
  Usage:
    node scripts/smoke-checkout-cart.js

  It will:
    - POST /api/users/register
    - GET /api/products
    - POST /api/cart/item
    - GET /api/cart
    - (optional) GET /api/users/address
    - POST /api/orders (paymentMethod=gcash)
    - POST /api/cart/clear
*/

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function requestJson(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const payload = body ? Buffer.from(JSON.stringify(body)) : null;

    const req = http.request(
      {
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers: {
          ...(payload
            ? {
                'Content-Type': 'application/json',
                'Content-Length': payload.length,
              }
            : {}),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const ct = res.headers['content-type'] || '';
          const isJson = ct.includes('application/json');
          const parsed = isJson && data ? safeJsonParse(data) : data;
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function randUser() {
  const suffix = Math.random().toString(16).slice(2, 10);
  return {
    username: `checkout_${suffix}`,
    email: `checkout_${suffix}@test.com`,
    password: 'Test1234',
  };
}

(async () => {
  console.log('BASE_URL:', BASE_URL);

  const user = randUser();
  const reg = await requestJson('POST', '/api/users/register', user);
  if (reg.status !== 201 || !reg.body?.token) {
    throw new Error(reg.body?.message || `Register failed (HTTP ${reg.status})`);
  }

  const token = reg.body.token;

  const productsRes = await requestJson('GET', '/api/products', null, {
    Authorization: `Bearer ${token}`,
  });
  if (productsRes.status !== 200) {
    throw new Error(productsRes.body?.message || `Products fetch failed (HTTP ${productsRes.status})`);
  }

  const products = productsRes.body?.data || productsRes.body;
  const product = (products || []).find((p) => Number(p?.stock ?? 0) > 0) || (products || [])[0];
  if (!product?._id) throw new Error('No products available to checkout');

  const safeQty = Math.max(1, Math.min(1, Number(product.stock ?? 0) || 0));
  if (safeQty <= 0) throw new Error('No in-stock products available to checkout');

  const setItem = await requestJson(
    'POST',
    '/api/cart/item',
    { productId: product._id, quantity: safeQty },
    { Authorization: `Bearer ${token}` }
  );
  if (setItem.status !== 200) {
    throw new Error(setItem.body?.message || `Cart item set failed (HTTP ${setItem.status})`);
  }

  const cartRes = await requestJson('GET', '/api/cart', null, {
    Authorization: `Bearer ${token}`,
  });
  if (cartRes.status !== 200) {
    throw new Error(cartRes.body?.message || `Cart fetch failed (HTTP ${cartRes.status})`);
  }

  const cart = cartRes.body?.data || cartRes.body;
  const items = (cart?.items || []).map((it) => ({
    product: it.productId,
    quantity: it.quantity,
    price: it.price,
  }));
  if (!items.length) throw new Error('Cart is empty after adding item');

  const addrRes = await requestJson('GET', '/api/users/address', null, {
    Authorization: `Bearer ${token}`,
  }).catch(() => null);
  const addr = addrRes?.body?.data || null;

  const subtotal = items.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.quantity || 0), 0);
  const totalAmount = subtotal * 1.15;

  const orderData = {
    items,
    totalAmount,
    shippingAddress: addr || {
      street: 'N/A',
      city: 'N/A',
      state: 'N/A',
      zip: 'N/A',
      country: 'PH',
    },
    paymentMethod: 'gcash',
  };

  const orderRes = await requestJson('POST', '/api/orders', orderData, {
    Authorization: `Bearer ${token}`,
  });
  if (orderRes.status !== 201) {
    throw new Error(orderRes.body?.message || `Order creation failed (HTTP ${orderRes.status})`);
  }

  const order = orderRes.body?.data || orderRes.body;
  if (!order?._id) throw new Error('Order creation response missing order id');

  const clearRes = await requestJson('POST', '/api/cart/clear', {}, {
    Authorization: `Bearer ${token}`,
  });
  if (clearRes.status !== 200) {
    throw new Error(clearRes.body?.message || `Cart clear failed (HTTP ${clearRes.status})`);
  }

  console.log('✅ Checkout smoke test: PASS', { orderId: order._id, paymentMethod: order.paymentMethod });
})().catch((e) => {
  console.error('❌ Checkout smoke test: FAIL', e.message);
  process.exit(1);
});
