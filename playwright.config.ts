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
    command: "pnpm dev",
    env: {
      VITE_VISUAL_COMPOSER_URL: "http://localhost:3001?editMode=true",
      BLOCK_DEFINITIONS_FILE:
        "/var/folders/zr/wdph4q613m5brhzczkbs62y80000gq/T/opencode/talk-cms-e2e-block-definitions.json",
    },
    url: "http://localhost:3000",
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
