/*
  Minimal auth smoke test (no external deps).
  Usage:
    node scripts/smoke-auth.js

  It will:
    - GET /api/health
    - POST /api/users/register
    - POST /api/users/login
    - (optional) GET /api/users/list if the user is admin
*/

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

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
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function safeJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

function randUser() {
  const suffix = Math.random().toString(16).slice(2, 10);
  return {
    username: `user_${suffix}`,
    email: `user_${suffix}@test.com`,
    password: 'Test1234',
  };
}

(async () => {
  console.log('BASE_URL:', BASE_URL);

  const health = await requestJson('GET', '/api/health');
  console.log('\nGET /api/health =>', health.status, health.body);

  if (health.status !== 200) process.exit(1);

  const user = randUser();

  const reg = await requestJson('POST', '/api/users/register', user);
  console.log('\nPOST /api/users/register =>', reg.status, reg.body);

  const login = await requestJson('POST', '/api/users/login', {
    username: user.username,
    password: user.password,
  });
  console.log('\nPOST /api/users/login =>', login.status, login.body);

  if (login.body && login.body.token) {
    const list = await requestJson(
      'GET',
      '/api/users/list',
      null,
      { Authorization: `Bearer ${login.body.token}` }
    );
    console.log('\nGET /api/users/list =>', list.status, list.body);
  }
})().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
