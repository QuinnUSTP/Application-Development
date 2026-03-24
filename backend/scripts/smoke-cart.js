/**
 * Smoke test: cart endpoints (server-side cart in MongoDB)
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

  // Register
  const user = randomUser();
  let r = await request('/api/users/register', { method: 'POST', body: user });
  console.log('\nPOST /api/users/register =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Register failed');
  const token = r.json?.token;

  // Products
  r = await request('/api/products', { method: 'GET', token });
  console.log('\nGET /api/products =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Products fetch failed');
  const products = Array.isArray(r.json?.data) ? r.json.data : (Array.isArray(r.json) ? r.json : []);
  if (!products.length) throw new Error('No products found; seed the DB first.');

  // Pick a product that has stock so the test is stable even if previous runs purchased items.
  const inStock = products.find((p) => Number(p.stock || 0) > 0) || products[0];
  const productId = inStock._id || inStock.id;
  const safeQty = Math.min(2, Math.max(1, Number(inStock.stock || 1)));

  // Get empty cart
  r = await request('/api/cart', { method: 'GET', token });
  console.log('\nGET /api/cart =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Cart fetch failed');

  // Set item quantity (safe vs stock)
  r = await request('/api/cart/item', { method: 'POST', token, body: { productId, quantity: safeQty } });
  console.log('\nPOST /api/cart/item =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Set cart item failed');

  // Clear
  r = await request('/api/cart/clear', { method: 'POST', token });
  console.log('\nPOST /api/cart/clear =>', r.status);
  if (!r.ok) throw new Error(r.json?.message || 'Clear cart failed');

  console.log('\n✅ Cart smoke test: PASS');
}

main().catch((err) => {
  console.error('\n❌ Cart smoke test: FAIL');
  console.error(err?.stack || err);
  process.exitCode = 1;
});
