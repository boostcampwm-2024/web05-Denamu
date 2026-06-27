import { config as loadEnv } from "dotenv";

import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
loadEnv({ path: ".env.e2e" });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/__tests__/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: process.env.E2E_BASE_URL || "https://localhost",
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      testIgnore: /mocked-ui\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      testIgnore: /mocked-ui\.spec\.ts/,
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      testIgnore: /mocked-ui\.spec\.ts/,
      use: { ...devices["Desktop Safari"] },
    },

    /* 백엔드/Nginx 없이 Vite dev 서버 + 네트워크 mock 으로 동작하는 UI 플로우 E2E.
       chromium 단독 실행하며 아래 webServer 가 자동 기동한다. */
    {
      name: "ui-mocked",
      testMatch: /mocked-ui\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.E2E_UI_BASE_URL || "http://localhost:5173",
        ignoreHTTPSErrors: true,
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* ui-mocked 프로젝트용 정적 프리뷰 서버.
     dev 가 아닌 prod 빌드를 서빙해 앱 내 axios-mock-adapter(import.meta.env.DEV)를 비활성화하고,
     모든 네트워크를 page.route 로 제어할 수 있게 한다. 다른 프로젝트(실서버 대상)에는 영향 없음. */
  webServer: {
    command: "npm run build:local && npm run preview -- --port 5173 --strictPort",
    url: process.env.E2E_UI_BASE_URL || "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
