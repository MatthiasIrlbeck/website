import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const base = process.env.BASE_PATH ?? '/website';
const browserPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:4321${base === '/' ? '' : base}/`,
    browserName: 'chromium',
    launchOptions: browserPath ? { executablePath: browserPath } : {},
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --ignore-lock --host 127.0.0.1 --port 4321',
    url: `http://127.0.0.1:4321${base === '/' ? '' : base}/`,
    reuseExistingServer: false,
    timeout: 30000,
    env: { ASTRO_TELEMETRY_DISABLED: '1' },
  },
});
