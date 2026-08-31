import { expect, test } from "@playwright/test"

const savedPage = {
  id: "page-1",
  blocks: [
    { id: "hero-1", type: "Hero", parentId: null, content: { title: "Saved hero" } },
  ],
  createdAt: "2026-08-31T10:00:00.000Z",
}

test("navigates from the dashboard through pages and back from the composer", async ({ page }) => {
  let pages = [savedPage]
  let updateMethod: string | undefined
  await page.route("**/api/internal/block-definitions", async (route) => {
    await route.fulfill({ json: [] })
  })
  await page.route("**/api/internal/pages*", async (route) => {
    if (route.request().method() === "DELETE") {
      pages = []
      await route.fulfill({ status: 204, body: "" })
      return
    }
    if (route.request().method() === "POST") {
      await route.fulfill({ status: 201, json: savedPage })
      return
    }
    if (route.request().method() === "PUT") {
      updateMethod = route.request().method()
      await route.fulfill({ status: 204, body: "" })
      return
    }
    await route.fulfill({ json: pages })
  })
  await page.route("**/api/content/v1/pages/page-1", async (route) => {
    await route.fulfill({ json: savedPage })
  })
  await page.route("http://localhost:3001/**", async (route) => {
    await route.fulfill({
      contentType: "text/html",
      body: "<!doctype html><html><body>Visual composer preview</body></html>",
    })
  })

  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible()
  await expect(page.locator('a[aria-current="page"]')).toHaveCount(1)
  await page.getByRole("link", { name: "Pages" }).first().click()

  await expect(page).toHaveURL(/\/content\/pages\/?$/)
  await expect(page.locator('a[aria-current="page"]')).toHaveCount(1)
  await expect(page.getByRole("table", { name: "Saved pages" })).toBeVisible()
  await page.getByRole("link", { name: "page-1", exact: true }).click()

  await expect(page).toHaveURL(/\/content\/pages\/page-1$/)
  await expect(page.getByTitle("Visual Composer")).toBeVisible()
  await expect(page.getByRole("button", { name: "Hero" }).first()).toBeVisible()
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page.getByText("Page saved.")).toBeVisible()
  expect(updateMethod).toBe("PUT")
  await page.getByRole("link", { name: "Back to pages" }).click()

  await expect(page).toHaveURL(/\/content\/pages\/?$/)
  await expect(page.getByRole("heading", { name: "Pages" })).toBeVisible()
})

test("creates and deletes pages from the pages list", async ({ page }) => {
  let pages = [savedPage]
  let createdRequest: unknown
  await page.route("**/api/internal/block-definitions", async (route) => {
    await route.fulfill({ json: [] })
  })
  await page.route("**/api/internal/pages*", async (route) => {
    if (route.request().method() === "POST") {
      createdRequest = route.request().postDataJSON()
      await route.fulfill({ status: 201, json: savedPage })
      return
    }
    if (route.request().method() === "DELETE") {
      pages = []
      await route.fulfill({ status: 204, body: "" })
      return
    }
    await route.fulfill({ json: pages })
  })
  await page.route("http://localhost:3001/**", async (route) => {
    await route.fulfill({ contentType: "text/html", body: "<!doctype html><html><body>Preview</body></html>" })
  })
  await page.route("**/api/content/v1/pages/page-1", async (route) => {
    await route.fulfill({ json: savedPage })
  })

  await page.goto("/content/pages")
  await page.getByRole("link", { name: "page-1", exact: true }).click()
  await expect(page.getByRole("button", { name: "Hero" }).first()).toBeVisible()
  await page.getByRole("link", { name: "Back to pages" }).click()
  await page.getByRole("link", { name: "Create page" }).click()
  await expect(page).toHaveURL(/\/content\/pages\/new$/)
  await expect(page.getByTitle("Visual Composer")).toBeVisible()
  await page.waitForLoadState("networkidle")
  await page.getByRole("button", { name: "Save" }).click()
  await expect(page).toHaveURL(/\/content\/pages\/page-1$/)
  expect(createdRequest).toEqual({ blocks: [] })

  await page.goto("/content/pages")
  page.on("dialog", (dialog) => dialog.accept())
  await page.getByLabel("Delete page page-1").click()
  await expect(page.getByTestId("page-row-page-1")).toHaveCount(0)
  await expect(page.getByText("Page page-1 deleted.")).toBeVisible()
})
