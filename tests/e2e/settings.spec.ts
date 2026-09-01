import { expect, test } from "@playwright/test"

const initialSettings = {
  themeMode: "dark",
  visualComposerUrl: "https://preview.example.com?editMode=true",
  updatedAt: "2026-09-01T10:00:00.000Z",
}

test("loads and saves account settings", async ({ page }) => {
  let savedBody: unknown
  await page.route("**/api/internal/settings", async (route) => {
    if (route.request().method() === "PUT") {
      savedBody = route.request().postDataJSON()
      await route.fulfill({
        json: {
          ...savedBody as object,
          updatedAt: "2026-09-01T11:00:00.000Z",
        },
      })
      return
    }
    await route.fulfill({ json: initialSettings })
  })

  await page.goto("/settings")

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
  await expect(page.getByLabel("Use dark mode")).toBeChecked()
  await expect(page.getByLabel("Preview site URL")).toHaveValue(
    initialSettings.visualComposerUrl
  )

  await page.getByLabel("Use dark mode").click()
  await page.getByLabel("Preview site URL").fill("https://site.example.com/editor")
  await page.getByRole("button", { name: "Save settings" }).click()

  await expect(page.getByText("Settings saved. Your workspace and visual composer are up to date.")).toBeVisible()
  expect(savedBody).toEqual({
    themeMode: "light",
    visualComposerUrl: "https://site.example.com/editor",
  })
  await expect(page.locator("html")).not.toHaveClass(/dark/)
})

test("settings layout remains usable on a small screen", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.route("**/api/internal/settings", (route) =>
    route.fulfill({ json: initialSettings })
  )

  await page.goto("/settings")

  await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Save settings" })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375)
})
