import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    env: {
      VITE_VISUAL_COMPOSER_URL: "http://localhost:3001?editMode=true",
    },
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
