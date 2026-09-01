import { defineConfig, devices } from "@playwright/test"

const port = process.env.PLAYWRIGHT_PORT ?? "3000"
const webServerCommand = process.env.PLAYWRIGHT_PRODUCTION
  ? `${process.env.PLAYWRIGHT_SKIP_BUILD ? "" : "pnpm build && "}PORT=${port} node .output/server/index.mjs`
  : `pnpm dev --port ${port}`

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
    command: webServerCommand,
    env: {
      VITE_VISUAL_COMPOSER_URL: "http://localhost:3001?editMode=true",
      BLOCK_DEFINITIONS_FILE:
        "/var/folders/zr/wdph4q613m5brhzczkbs62y80000gq/T/opencode/talk-cms-e2e-block-definitions.json",
    },
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
