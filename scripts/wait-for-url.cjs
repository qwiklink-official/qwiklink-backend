// scripts/wait-for-url.cjs
// Simple Node script (no deps) for CI to wait for an HTTP URL to return 2xx/3xx.
const { URL } = require('url');
const http = require('http');
const https = require('https');

const urlArg = process.argv[2];
const attempts = Number(process.argv[3] || 30);
const delay = Number(process.argv[4] || 1000);

if (!urlArg) {
  console.error('Usage: node scripts/wait-for-url.cjs <url> [attempts] [delayMs]');
  process.exit(2);
}

const urlObj = new URL(urlArg);
const client = urlObj.protocol === 'https:' ? https : http;

function checkOnce() {
  return new Promise((resolve, reject) => {
    const req = client.request(
      {
        method: 'GET',
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + (urlObj.search || ''),
        timeout: 2000,
      },
      (res) => {
        resolve(res.statusCode);
      }
    );
    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.end();
  });
}

(async () => {
  for (let i = 0; i < attempts; i++) {
    try {
      const status = await checkOnce();
      if (status >= 200 && status < 400) {
        console.log(`OK ${urlArg} status=${status}`);
        process.exit(0);
      }
      console.log(`Attempt ${i + 1}: status=${status}`);
    } catch (e) {
      console.log(`Attempt ${i + 1}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, delay));
  }
  console.error(`Timed out waiting for ${urlArg}`);
  process.exit(1);
})();
