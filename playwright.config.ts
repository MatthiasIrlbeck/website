import { defineConfig } from '@playwright/test';
const base = process.env.BASE_PATH ?? '/website';
const port = Number(process.env.PLAYWRIGHT_PORT ?? 4321);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PLAYWRIGHT_PORT must be a valid port number');
const fixturePort = Number(process.env.PLAYWRIGHT_FIXTURE_PORT ?? port + 1);
if (!Number.isInteger(fixturePort) || fixturePort < 1 || fixturePort > 65535 || fixturePort === port) throw new Error('PLAYWRIGHT_FIXTURE_PORT must be a different valid port number');
const requestedBrowsers = [...new Set((process.env.PLAYWRIGHT_BROWSERS ?? 'chromium').split(',').map(name => name.trim()))];
const browserNames = ['chromium', 'firefox', 'webkit'] as const;
if (requestedBrowsers.some(name => !browserNames.includes(name as typeof browserNames[number]))) throw new Error('PLAYWRIGHT_BROWSERS must list chromium, firefox, or webkit');
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${port}${base === '/' ? '' : base}/`,
    trace: 'retain-on-failure',
  },
  projects: requestedBrowsers.map(name => ({
    name,
    use: {
      browserName: name as typeof browserNames[number],
      ...(name === 'chromium' && browserPath ? { launchOptions: { executablePath: browserPath } } : {}),
    },
  })),
  webServer: [{
    command: `npm run preview -- --ignore-lock --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}${base === '/' ? '' : base}/`,
    reuseExistingServer: false,
    timeout: 30000,
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  }, {
    command: `npm run dev -- --config tests/fixtures/media/astro.config.mjs --ignore-lock --host 127.0.0.1 --port ${fixturePort}`,
    url: `http://127.0.0.1:${fixturePort}${base === '/' ? '' : base}/`,
    reuseExistingServer: false,
    timeout: 30000,
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  }],
});
