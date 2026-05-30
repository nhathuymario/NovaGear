const http = require('http');
const https = require('https');
const { URL } = require('url');

// Simple probe to check if API is up. If not, set SKIP_API so tests skip API suite.
module.exports = async function () {
  const apiUrl = process.env.API_URL || 'http://localhost:8080/api';
  try {
    const url = new URL(apiUrl);
    const lib = url.protocol === 'https:' ? https : http;
    const options = {
      method: 'GET',
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname || '/',
      timeout: 3000,
    };

    await new Promise((resolve) => {
      const req = lib.request(options, (res) => {
        // Any HTTP response means the service is reachable.
        // We only skip API tests on transport errors/timeouts, not on 4xx/5xx responses.
        console.log(`\n[bootstrap] API probe reached ${apiUrl} (status ${res.statusCode}). API tests will run.`);
        // consume data
        res.on('data', () => {});
        res.on('end', resolve);
      });
      req.on('error', (err) => {
        process.env.SKIP_API = '1';
        console.warn(`\n[bootstrap] API probe failed (${err.message}). Setting SKIP_API=1 to skip API tests.`);
        resolve();
      });
      req.on('timeout', () => {
        req.destroy();
        process.env.SKIP_API = '1';
        console.warn(`\n[bootstrap] API probe timed out. Setting SKIP_API=1 to skip API tests.`);
        resolve();
      });
      req.end();
    });
  } catch (err) {
    process.env.SKIP_API = '1';
    console.warn(`\n[bootstrap] API probe error: ${err.message}. SKIP_API=1`);
  }
};


