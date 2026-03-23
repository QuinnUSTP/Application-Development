/**
 * Smoke test: user address endpoints
 * - Login as admin
 * - GET /api/users/address
 * - POST /api/users/address
 * - GET /api/users/address
 */

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

async function main() {
  console.log('BASE_URL:', BASE_URL);

  const loginRes = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });

  const loginJson = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Login failed:', loginRes.status, loginJson);
    process.exit(1);
  }

  const token = loginJson.token;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const get1 = await fetch(`${BASE_URL}/api/users/address`, { headers });
  console.log('GET /api/users/address =>', get1.status, await get1.json());

  const address = {
    name: 'Quinn Lynnard Castro',
    street: 'Mambuaya',
    city: 'Cagayan de Oro',
    state: 'Misamis Oriental',
    zip: '9000',
    country: 'Philippines',
  };

  const post = await fetch(`${BASE_URL}/api/users/address`, {
    method: 'POST',
    headers,
    body: JSON.stringify(address),
  });
  console.log('POST /api/users/address =>', post.status, await post.json());

  const get2 = await fetch(`${BASE_URL}/api/users/address`, { headers });
  console.log('GET /api/users/address =>', get2.status, await get2.json());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
