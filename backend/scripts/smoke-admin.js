/*
  Admin flow smoke test (no external deps).
  Usage:
    node scripts/smoke-admin.js

  It will:
    - Login as admin (admin/admin123)
    - Call GET /api/users/list using Bearer token
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

(async () => {
  console.log('BASE_URL:', BASE_URL);

  const login = await requestJson('POST', '/api/users/login', {
    username: 'admin',
    password: 'admin123',
  });

  console.log('\nPOST /api/users/login =>', login.status, login.body);

  const token = login.body && login.body.token;
  if (!token) {
    console.error('No token returned from login; cannot test admin list.');
    process.exit(1);
  }

  const list = await requestJson('GET', '/api/users/list', null, {
    Authorization: `Bearer ${token}`,
  });

  console.log('\nGET /api/users/list =>', list.status);
  console.log(list.body);

  if (list.status !== 200) process.exit(1);
})().catch((err) => {
  console.error('Smoke test failed:', err);
  process.exit(1);
});
