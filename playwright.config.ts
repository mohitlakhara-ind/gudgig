import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const PORT = process.env.PORT || 3000;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: path.join(__dirname, 'tests/e2e'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  webServer: {
    command: 'npm run dev:both',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});