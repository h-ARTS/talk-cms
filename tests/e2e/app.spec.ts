import { expect, test } from "@playwright/test"

const generatedBlocks = [
  {
    id: "hero-1",
    type: "Hero",
    parentId: null,
    content: { title: "Generated headline" },
  },
]

const blockDefinitions = [
  {
    name: "Hero",
    metadata: { label: "Hero", description: "Campaign hero" },
    fields: [{ key: "title", type: "text", label: "Title", default: "" }],
    allowedChildren: false,
  },
]

test.beforeEach(async ({ page }) => {
  await page.route("**/api/internal/block-definitions", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ json: blockDefinitions })
      return
    }
    await route.continue()
  })
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
  await page.route("**/api/internal/block-builder", async (route) => {
    await route.fulfill({ json: generatedBlocks })
  })

  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Open chat" }).click()
  await page.getByPlaceholder("What do you want to build?").fill("Build a hero")
  await page.getByRole("button", { name: "Submit prompt" }).click()

  await expect(page.getByText("Blocks successfully build.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Hero" }).first()).toBeVisible()
})

test("saves the creator's current page without using the block builder", async ({
  page,
}) => {
  let savedRequest: unknown
  await page.route("**/api/internal/pages", async (route) => {
    savedRequest = route.request().postDataJSON()
    await route.fulfill({ status: 201, json: { id: "page-1", blocks: [] } })
  })

  await page.goto("/")
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Save" }).click()

  await expect(page.getByText("Page saved.")).toBeVisible()
  expect(savedRequest).toEqual({ blocks: [] })
})

test("serves the migrated API route", async ({ request }) => {
  const response = await request.get("/api/internal/hello")

  expect(response.ok()).toBeTruthy()
  await expect(response.json()).resolves.toEqual({ name: "John Doe" })
})

test("mounts the public content API separately", async ({ request }) => {
  const response = await request.get("/api/content/v1/pages/missing-page")

  expect(response.status()).toBe(404)
  await expect(response.json()).resolves.toEqual({ error: "Page not found" })
})
