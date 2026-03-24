/**
 * Smoke test: create an order and verify receipt archive endpoint.
 *
 * Preconditions:
 * - Backend running at BASE_URL
 * - Products seeded (at least 1 product exists)
 * - Users endpoints available
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function request(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, json };
}

function randomUser() {
  const id = Math.random().toString(16).slice(2, 10);
  return {
    username: `user_${id}`,
    email: `user_${id}@test.com`,
    password: 'password123',
  };
}

async function main() {
  console.log('BASE_URL:', BASE_URL);

  // 1) Register + login
  const user = randomUser();
  let r = await request('/api/users/register', { method: 'POST', body: user });
  console.log('\nPOST /api/users/register =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Register failed');

  const token = r.json?.token;
  if (!token) throw new Error('No token returned from register');

  // 2) Fetch products, pick one
  r = await request('/api/products', { method: 'GET', token });
  console.log('\nGET /api/products =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Products fetch failed');

  const products = Array.isArray(r.json?.data) ? r.json.data : (Array.isArray(r.json) ? r.json : []);
  if (!products.length) throw new Error('No products found; seed the DB first.');

  // Pick an in-stock product so the smoke test stays stable.
  const p = products.find((x) => Number(x.stock || 0) > 0) || products[0];
  const productId = p._id || p.id;
  if (!productId) throw new Error('Product is missing _id/id');

  // 3) Create order
  const orderBody = {
    items: [{ product: productId, quantity: 1, price: Number(p.price || 1) }],
    totalAmount: Number(p.price || 1) * 1.15,
    shippingAddress: {
      street: 'Test St',
      city: 'Test City',
      state: 'Test State',
      zip: '0000',
      country: 'Test Country',
    },
    paymentMethod: 'credit_card',
  };

  r = await request('/api/orders', { method: 'POST', token, body: orderBody });
  console.log('\nPOST /api/orders =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Order create failed');

  const orderId = r.json?.data?._id || r.json?._id;
  if (!orderId) throw new Error('No order id returned');

  // 4) Archive receipt (explicit best-effort endpoint)
  r = await request(`/api/orders/${orderId}/receipt/archive`, { method: 'POST', token });
  console.log(`\nPOST /api/orders/${orderId}/receipt/archive =>`, r.status, r.json);
  if (!r.ok) throw new Error(r.json?.message || 'Receipt archive failed');

  // 5) Read archived receipt
  r = await request(`/api/orders/${orderId}/receipt`, { method: 'GET', token });
  console.log(`\nGET /api/orders/${orderId}/receipt =>`, r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Receipt fetch failed');

  const receipt = r.json?.data;
  if (!receipt || receipt.orderId !== orderId) {
    throw new Error('Receipt payload missing/invalid');
  }

  console.log('\n✅ Receipt archive smoke test: PASS');
}

main().catch(err => {
  console.error('\n❌ Receipt archive smoke test: FAIL');
  console.error(err?.stack || err);
  process.exitCode = 1;
});
