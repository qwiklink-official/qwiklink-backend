// Simple auth test script: logs in and calls the protected route.
// Works with Node 18+ (global fetch) or with node-fetch via dynamic import.
let fetchImpl = null;

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const testUser = {
  email: process.env.TEST_EMAIL || 'test@example.com',
  password: process.env.TEST_PASSWORD || 'password123',
};

async function initFetch() {
  if (global.fetch) {
    fetchImpl = global.fetch;
    return;
  }
  try {
    const mod = await import('node-fetch');
    fetchImpl = mod.default || mod;
    return;
  } catch (e) {
    try {
      // last-resort require (shouldn't happen in ESM environment)
      // eslint-disable-next-line global-require
      fetchImpl = require('node-fetch');
      return;
    } catch (err) {
      throw new Error('No fetch available. Install node 18+ or add node-fetch dependency.');
    }
  }
}

async function login() {
  const res = await fetchImpl(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser),
  });
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`Login failed: ${res.status} ${body}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return res.json();
}

async function register() {
  // minimal registration payload (match server's required fields)
  const payload = {
    email: testUser.email,
    password: testUser.password,
    firstName: process.env.TEST_FIRST_NAME || 'Test',
    lastName: process.env.TEST_LAST_NAME || 'User',
    phoneNumber: process.env.TEST_PHONE || '0000000000',
    role: process.env.TEST_ROLE || 'customer',
  };
  const res = await fetchImpl(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Register failed: ${res.status} ${text}`);
  return JSON.parse(text);
}

async function callProtected(token) {
  const res = await fetchImpl(`${API_BASE}/api/protected`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function main() {
  try {
  await initFetch();
    let loginData;
    try {
      loginData = await login();
    } catch (err) {
      if (err.status === 401) {
        console.log('Login failed with 401 — attempting to register test user...');
        await register();
        console.log('Registration succeeded — retrying login...');
        loginData = await login();
      } else {
        throw err;
      }
    }
    const token = loginData.token || loginData.accessToken || loginData.jwt;
    if (!token) throw new Error('Token not returned from login');
    console.log('Login token received. Calling protected route...');
    const protectedRes = await callProtected(token);
    console.log('Protected response status:', protectedRes.status);
    console.log('Protected response body:', protectedRes.body);
  } catch (err) {
    console.error('Auth test failed:', err.message || err);
    process.exit(1);
  }
}

main();
