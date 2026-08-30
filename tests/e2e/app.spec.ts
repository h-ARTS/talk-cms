import { expect, test } from "@playwright/test"

const generatedBlocks = [
  {
    id: "headline-1",
    type: "Headline",
    parentId: null,
    content: { title: "Generated headline" },
  },
]

test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:3001/**", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body>Visual composer preview</body></html>",
    })
  })
})

test("loads the editor and supports theme and pane resizing", async ({ page }) => {
  await page.goto("/")
  await page.waitForLoadState("networkidle")

  await expect(page).toHaveTitle("Talk CMS")
  await expect(page.getByTitle("Visual Composer")).toBeVisible()

  const previewPanel = page.getByTitle("Visual Composer").locator("..")
  await expect(previewPanel).toHaveCSS("background-color", "rgb(41, 41, 41)")

  await page.getByLabel("Dark mode").click()
  await expect(previewPanel).toHaveCSS("background-color", "rgb(245, 245, 245)")

  const separator = page.locator(".resize-handle")
  await expect(separator).toHaveCSS("width", "6px")

  const separatorBox = await separator.boundingBox()
  expect(separatorBox).not.toBeNull()
  if (!separatorBox) return

  await page.mouse.move(separatorBox.x + 3, separatorBox.y + separatorBox.height / 2)
  await page.mouse.down()
  await expect(page.getByTestId("iframe-drag-overlay")).toBeVisible()
  await page.mouse.move(separatorBox.x - 100, separatorBox.y + separatorBox.height / 2)
  await page.mouse.up()
  await expect(page.getByTestId("iframe-drag-overlay")).toHaveCount(0)
})

test("submits a mocked block-building request", async ({ page }) => {
  await page.route("**/api/block-builder", async (route) => {
    await route.fulfill({ json: generatedBlocks })
  })

  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Open chat" }).click()
  await page.getByPlaceholder("What do you want to build?").fill("Build a hero")
  await page.getByRole("button", { name: "Submit prompt" }).click()

  await expect(page.getByText("Blocks successfully build.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Headline" })).toHaveCount(2)
})

test("serves the migrated API route", async ({ request }) => {
  const response = await request.get("/api/hello")

  expect(response.ok()).toBeTruthy()
  await expect(response.json()).resolves.toEqual({ name: "John Doe" })
})
