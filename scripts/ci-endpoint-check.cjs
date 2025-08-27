// scripts/ci-endpoint-check.cjs
// Minimal endpoint check used by CI: verifies /health and /api/protected via login.
const { URL } = require('url');
const http = require('http');
const https = require('https');

function request(urlStr, options = {}, body = null, timeout = 5000) {
  const urlObj = new URL(urlStr);
  const client = urlObj.protocol === 'https:' ? https : http;
  const opts = {
    method: options.method || 'GET',
    hostname: urlObj.hostname,
    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
    path: urlObj.pathname + (urlObj.search || ''),
    headers: options.headers || {},
  };
  return new Promise((resolve, reject) => {
    const req = client.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(timeout, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    if (body) req.write(body);
    req.end();
  });
}

async function main() {
  try {
    const base = process.env.API_BASE || 'http://localhost:5000';
    const health = await request(`${base}/health`);
    if (health.status < 200 || health.status >= 400) {
      console.error('Health check failed', health.status, health.body);
      process.exit(2);
    }
    console.log('Health OK');

    // Attempt login with seeded test user
    const email = process.env.TEST_EMAIL || 'test@example.com';
    const password = process.env.TEST_PASSWORD || 'password123';
    const payload = JSON.stringify({ email, password });

    const login = await request(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, payload);
    if (login.status !== 200) {
      console.error('Login failed', login.status, login.body);
      process.exit(3);
    }
    const loginJson = JSON.parse(login.body);
    const token = loginJson.token || loginJson.accessToken || loginJson.jwt;
    if (!token) {
      console.error('Login did not return token', login.body);
      process.exit(4);
    }
    console.log('Login OK');

    const protectedRes = await request(`${base}/api/protected`, { headers: { Authorization: `Bearer ${token}` } });
    if (protectedRes.status !== 200) {
      console.error('/api/protected failed', protectedRes.status, protectedRes.body);
      process.exit(5);
    }
    console.log('/api/protected OK');
    process.exit(0);
  } catch (e) {
    console.error('CI endpoint check error:', e && e.message ? e.message : e);
    process.exit(10);
  }
}

main();
