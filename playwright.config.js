const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  testMatch: '*.spec.js',
  fullyParallel: true,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    viewport: { width: 800, height: 900 },
  },
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    { name: 'chromium' },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },
});
