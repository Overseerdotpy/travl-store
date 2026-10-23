import { defineConfig } from '@playwright/test';

// The hero clip is H.264, which Playwright's bundled Chromium doesn't ship.
// Use real Chrome: `channel: 'chrome'` (preinstalled on GitHub's ubuntu runners),
// or point CHROME_PATH at any Chrome/Chromium build that has proprietary codecs.
const chromePath = process.env.CHROME_PATH;
const browser = chromePath
  ? { launchOptions: { executablePath: chromePath, args: ['--no-sandbox'] } }
  : { channel: 'chrome' };

export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  workers: process.env.CI ? 2 : 3,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1360, height: 900 },
    colorScheme: 'dark',
    trace: 'retain-on-failure',
    ...browser,
  },
  webServer: {
    command: 'npx http-server dist -p 4173 -s -c-1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
