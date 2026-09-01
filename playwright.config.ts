import { defineConfig, devices } from "@playwright/test"

const port = process.env.PLAYWRIGHT_PORT ?? "3000"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${port}`,
    env: {
      VITE_VISUAL_COMPOSER_URL: "http://localhost:3001?editMode=true",
      BLOCK_DEFINITIONS_FILE:
        "/var/folders/zr/wdph4q613m5brhzczkbs62y80000gq/T/opencode/talk-cms-e2e-block-definitions.json",
    },
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
})
