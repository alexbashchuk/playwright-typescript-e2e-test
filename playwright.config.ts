import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';
import process from 'node:process';

// Load test environment variables.
loadEnv({ path: resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests',

  // Start Docker and the Compose services before running tests.
  globalSetup: './.github/global-setup.ts',

  // Numeric spec prefixes preserve the requested file order; one worker runs each file in sequence.
  fullyParallel: false,
  workers: 1,

  // Reject accidentally committed test.only calls on CI.
  forbidOnly: !!process.env.CI,

  retries: 0,

  outputDir: 'test-results',

  reporter: [
    ['html', {
      outputFolder: 'playwright-report',
      open: 'never',
    }],
    ['junit', {
      outputFile: 'test-results/junit.xml',
    }],
  ],

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',

    // Keep diagnostic artifacts when a test fails.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.PW_VIDEO === 'on' ? 'on' : 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
    {
      name: 'chrome',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});
