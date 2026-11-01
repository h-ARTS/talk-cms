import { expect, test } from "@playwright/test"

const settings = {
  themeMode: "light",
  visualComposerUrl: "http://localhost:3001?editMode=true",
  updatedAt: "2026-09-01T10:00:00.000Z",
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/internal/settings", (route) =>
    route.fulfill({ json: settings })
  )
  await page.route("**/api/internal/block-definitions", (route) =>
    route.fulfill({ json: [] })
  )
  await page.route("**/api/internal/pages*", (route) =>
    route.fulfill({ json: [] })
  )
})

const dashboardPages = [
  { path: "/", title: "Dashboard" },
  { path: "/blocks", title: "Block definitions" },
  { path: "/content/pages", title: "Pages" },
  { path: "/settings", title: "Settings" },
] as const

for (const { path, title } of dashboardPages) {
  for (const width of [375, 768, 1440, 1920]) {
    test(`${title} shares the page layout at ${width}px`, async ({ page }, testInfo) => {
      const browserErrors: string[] = []
      page.on("pageerror", (error) => browserErrors.push(error.message))
      page.on("console", (message) => {
        if (message.type() === "error") browserErrors.push(message.text())
      })
      await page.setViewportSize({ width, height: 900 })
      await page.goto(path)
      await page.waitForLoadState("networkidle")
      await page.evaluate(() => document.fonts.ready)

      const main = page.getByRole("main")
      const layout = main.locator(":scope > div")
      await expect(main).toHaveCount(1)
      await expect(layout).toHaveCount(1)
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
      await expect(page.getByRole("heading", { name: title, level: 1, exact: true })).toBeVisible()
      await expect(layout).toHaveCSS("max-width", "1280px")
      await expect(layout).toHaveCSS("padding-left", "24px")
      await expect(layout).toHaveCSS("padding-right", "24px")
      await expect(layout).toHaveCSS("padding-top", width < 768 ? "40px" : "56px")
      await expect(layout).toHaveCSS("padding-bottom", width < 768 ? "40px" : "56px")

      const mainBox = await main.boundingBox()
      const layoutBox = await layout.boundingBox()
      expect(mainBox).not.toBeNull()
      expect(layoutBox).not.toBeNull()
      expect(layoutBox!.width).toBeCloseTo(Math.min(1280, mainBox!.width), 0)
      expect(layoutBox!.x).toBeCloseTo(mainBox!.x + (mainBox!.width - layoutBox!.width) / 2, 0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      expect(browserErrors).toEqual([])

      if (width === 375 || width === 1920) {
        const screenshot = testInfo.outputPath("page-layout.png")
        await page.screenshot({ path: screenshot, fullPage: true })
        await testInfo.attach("page-layout", { path: screenshot, contentType: "image/png" })
      }
    })
  }
}

for (const path of ["/content/pages/new", "/content/pages/page-1"]) {
  test(`${path} keeps the full-screen composer layout`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.route("**/api/content/v1/pages/page-1", (route) =>
      route.fulfill({
        json: { id: "page-1", name: null, blocks: [], createdAt: settings.updatedAt },
      })
    )
    await page.route("http://localhost:3001/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><html><body>Visual composer preview</body></html>",
      })
    )
    await page.goto(path)
    await page.waitForLoadState("networkidle")

    await expect(page.getByTitle("Visual Composer")).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0)
    await expect(page.locator("main .max-w-7xl")).toHaveCount(0)
    const main = page.getByRole("main")
    await expect(main).toHaveCount(1)
    expect(await main.boundingBox()).toEqual({ x: 0, y: 0, width: 1440, height: 900 })
  })
}
