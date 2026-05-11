const path = require('path');
const { execSync } = require('child_process');

const command = process.argv[2];
const codeceptDir = path.join(__dirname, 'codeceptjs');

// ─── Port mapping ───────────────────────────────────────────
// Local ports (khi chạy `mvn spring-boot:run` hoặc IntelliJ)
//   Auth: 8081, User: 8082, Product: 8083, Cart: 8084
//   Order: 8085, Payment: 8086, Inventory: 8087, Shipping: 8090
//   Gateway: 8080
//
// Docker test ports (docker-compose.test.yml)
//   Auth: 8081, same as local (mapped 8081:8081)
//   All other services: same as local
//   Gateway: 8079 (mapped 8079:8080)

const envMaps = {
  test: {},
  'test:api': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8080/api/',
  },
  'test:e2e': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:cross-browser': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:smoke': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:admin': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  // ── Individual service API tests (direct to service, no gateway) ──
  'test:auth': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8081/api',
  },
  'test:product': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8083/api',
  },
  'test:cart': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8084/api',
  },
  'test:order': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8085/api',
  },
  'test:payment': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8086/api',
  },
  'test:shipping': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8090/api',
  },
  'test:inventory': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8087/api',
  },
  'test:user': {
    SKIP_BROWSER: '1',
    API_URL: 'http://127.0.0.1:8082/api',
  },
  // ── E2E tests (need gateway + frontend) ──
  'test:e2e:auth': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:home': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:product': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:cart': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:checkout': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:order': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:admin': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  'test:e2e:responsive': {
    API_URL: 'http://127.0.0.1:8080/api',
    FRONTEND_URL: 'http://127.0.0.1:5173',
  },
  report: {},
  'report:generate': {},
  'dry-run': {},
  'test:perf': {},
  'test:perf:stress': {},
  'test:perf:spike': {},
  'test:perf:soak': {},
};

if (!command || !envMaps[command]) {
  console.error(`Unknown test command: ${command || '(missing)'}`);
  process.exit(1);
}

const npmCmd = `npm --prefix ${codeceptDir} run ${command}`;
const env = { ...process.env, ...envMaps[command] };

try {
  execSync(npmCmd, {
    stdio: 'inherit',
    env,
    cwd: __dirname,
  });
  process.exit(0);
} catch (err) {
  process.exit(1);
}
