import { expect, test, type Locator, type Route } from "@playwright/test"

const initialSettings = {
  themeMode: "dark",
  visualComposerUrl: "https://preview.example.com?editMode=true",
  updatedAt: "2026-09-01T10:00:00.000Z",
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/internal/settings", (route) =>
    route.fulfill({ json: initialSettings })
  )
})

async function bounds(locator: Locator) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  return box!
}

test("loads and saves account settings", async ({ page }) => {
  const browserErrors: string[] = []
  page.on("pageerror", (error) => browserErrors.push(error.message))
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text())
  })
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

  await expect(page.getByRole("heading", { name: "Settings", level: 1, exact: true })).toBeVisible()
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
  expect(browserErrors).toEqual([])
})

test("groups settings into ordered, accessible sections", async ({ page }) => {
  await page.goto("/settings")

  const workspace = page.getByRole("region", { name: "Workspace settings", exact: true })
  const composer = page.getByRole("region", { name: "Visual Composer", exact: true })
  const settingsForm = page.locator("main form")
  const save = page.getByRole("button", { name: "Save settings" })
  await expect(workspace.getByRole("heading", { name: "Workspace settings", level: 2 })).toBeVisible()
  await expect(workspace.getByRole("heading", { name: "Appearance", level: 3 })).toBeVisible()
  await expect(workspace.getByRole("switch", { name: "Use dark mode" })).toBeChecked()
  await expect(composer.getByRole("heading", { name: "Visual Composer", level: 2 })).toBeVisible()
  await expect(composer.getByLabel("Preview site URL")).toHaveValue(initialSettings.visualComposerUrl)
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
  await expect(page.getByRole("heading", { level: 2 })).toHaveText(["Workspace settings", "Visual Composer"])
  await expect(page.getByRole("switch")).toHaveCount(1)
  await expect(page.getByLabel("Preview site URL")).toHaveCount(1)
  await expect(save).toHaveCount(1)
  await expect(settingsForm).toHaveCount(1)
  await expect(page.locator("main header")).toHaveCount(1)
  await expect(page.locator("main form header")).toHaveCount(0)
  await expect(settingsForm.getByRole("button", { name: "Save settings" })).toHaveCount(0)
  const formId = await settingsForm.getAttribute("id")
  expect(formId).toBeTruthy()
  await expect(save).toHaveAttribute("form", formId!)
  expect(await save.evaluate((button) => {
    const form = document.querySelector("main form")
    return form !== null &&
      (button.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  })).toBe(true)
  await expect(page.getByRole("tablist")).toHaveCount(0)
  expect(await save.evaluate((button) =>
    (button as HTMLButtonElement).form === document.querySelector("main form")
  )).toBe(true)
  await expect(workspace.getByText("Personalize Talk CMS for this account.")).toBeVisible()
  await expect(composer.getByText("Connect the end-user website or web app that renders content from Talk CMS.")).toBeVisible()
  await expect(composer.getByLabel("Preview site URL")).toHaveAttribute("aria-describedby", "visual-composer-url-help")
  await expect(composer.locator("#visual-composer-url-help")).toContainText("sends live block updates")
})

for (const themeMode of ["light", "dark"] as const) {
  for (const width of [375, 768, 1024, 1440]) {
    test(`${themeMode} settings layout at ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 812 })
      await page.route("**/api/internal/settings", (route) =>
        route.fulfill({ json: { ...initialSettings, themeMode } })
      )
      await page.goto("/settings")
      const workspace = page.getByRole("region", { name: "Workspace settings", exact: true })
      const composer = page.getByRole("region", { name: "Visual Composer", exact: true })
      await expect(composer).toBeVisible()
      await expect(page.locator("html")).toHaveAttribute("class", themeMode === "dark" ? "dark" : "")
      await page.evaluate(() => document.fonts.ready)

      const workspaceIntro = workspace.locator(":scope > div").first()
      const workspaceRow = workspace.locator(":scope > div").nth(1)
      const workspaceLabel = workspace.getByRole("heading", { name: "Appearance", level: 3 })
      const workspaceControls = workspaceRow.locator(":scope > div").nth(1)
      const composerIntro = composer.locator(":scope > div").first()
      const composerRow = composer.locator(":scope > div").nth(1)
      const composerLabel = composer.locator('label[for="visual-composer-url"]')
      const composerControls = composerRow.locator(":scope > div")
      await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-size", "36px")
      await expect(workspace.getByRole("heading", { level: 2 })).toHaveCSS("font-size", "24px")
      await expect(composer.getByRole("heading", { level: 2 })).toHaveCSS("font-size", "24px")
      await expect(workspaceLabel).toHaveCSS("font-size", "18px")
      await expect(composerLabel).toHaveCSS("font-size", "18px")
      await expect(workspace.locator('label[for="settings-dark-mode"]')).toHaveCSS("font-size", "14px")
      const [intro, left, right, nextIntro, nextLeft, nextRight, save, row, nextRow, heading] = await Promise.all([
        bounds(workspaceIntro), bounds(workspaceLabel), bounds(workspaceControls),
        bounds(composerIntro), bounds(composerLabel), bounds(composerControls),
        bounds(page.getByRole("button", { name: "Save settings" })),
        bounds(workspaceRow), bounds(composerRow), bounds(page.getByRole("heading", { level: 1 })),
      ])

      expect(row.y).toBeGreaterThanOrEqual(intro.y + intro.height)
      expect(nextIntro.y).toBeGreaterThan(row.y + row.height)
      expect(nextRow.y).toBeGreaterThanOrEqual(nextIntro.y + nextIntro.height)
      expect(save.y + save.height).toBeLessThan(intro.y)
      expect(Math.abs(intro.x - row.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(intro.width - row.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(nextIntro.width - nextRow.width)).toBeLessThanOrEqual(1)
      expect(save.x >= heading.x + heading.width || save.y >= heading.y + heading.height).toBe(true)
      for (const [divider, edge] of [
        [workspaceRow, "borderBottomWidth"],
        [composerRow, "borderBottomWidth"],
        [page.locator("main header"), "borderBottomWidth"],
      ] as const) {
        expect(await divider.evaluate((element, property) =>
          parseFloat(getComputedStyle(element)[property]), edge
        )).toBeGreaterThan(0)
      }
      expect(await workspaceControls.evaluate((element) => {
        const style = getComputedStyle(element)
        return style.borderTopWidth === "0px" && style.borderRightWidth === "0px" &&
          style.borderBottomWidth === "0px" && style.borderLeftWidth === "0px" &&
          style.backgroundColor === "rgba(0, 0, 0, 0)" && style.borderRadius === "0px" && style.boxShadow === "none"
      })).toBe(true)
      await expect(workspaceIntro).toHaveCSS("position", "static")
      await expect(composerIntro).toHaveCSS("position", "static")
      if (width >= 1024) {
        expect(left.x + left.width).toBeLessThan(right.x)
        expect(nextLeft.x + nextLeft.width).toBeLessThan(nextRight.x)
        expect(Math.abs(right.x - nextRight.x)).toBeLessThanOrEqual(1)
        expect(Math.abs(left.y - right.y)).toBeLessThanOrEqual(1)
        expect(Math.abs(nextLeft.y - nextRight.y)).toBeLessThanOrEqual(1)
        expect(Math.abs(save.x + save.width - nextRight.x - nextRight.width)).toBeLessThanOrEqual(1)
      } else {
        expect(right.y).toBeGreaterThan(left.y + left.height)
        expect(nextRight.y).toBeGreaterThan(nextLeft.y + nextLeft.height)
        expect(heading.y).toBeGreaterThanOrEqual(width < 768 ? 64 : 0)
        if (width < 768) {
          await expect(page.getByRole("button", { name: "Open navigation" })).toBeVisible()
          await page.getByRole("button", { name: "Open navigation" }).click()
          await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible()
          await page.getByRole("button", { name: "Close navigation" }).click()
        } else {
          await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible()
        }
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      const screenshot = testInfo.outputPath("layout.png")
      await page.screenshot({ path: screenshot, fullPage: true })
      await testInfo.attach("settings-layout", { path: screenshot, contentType: "image/png" })

      await page.getByLabel("Preview site URL").fill(`https://preview.example.com/${"long-path/".repeat(30)}`)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
      const longUrlScreenshot = testInfo.outputPath("long-url.png")
      await page.screenshot({ path: longUrlScreenshot, fullPage: true })
      await testInfo.attach("long-url-layout", { path: longUrlScreenshot, contentType: "image/png" })
      await page.getByRole("button", { name: "Save settings" }).scrollIntoViewIfNeeded()
      await expect(page.getByRole("button", { name: "Save settings" })).toBeInViewport()
    })
  }
}

test("document scrolling moves static titles and preserves drafts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 240 })
  const writes: string[] = []
  page.on("request", (request) => {
    if (request.url().endsWith("/api/internal/settings") && request.method() !== "GET") {
      writes.push(request.method())
    }
  })
  await page.goto("/settings")
  await page.getByRole("switch", { name: "Use dark mode" }).click()
  await page.getByLabel("Preview site URL").fill("https://draft.example.com/editor")
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)

  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  expect(maxScroll).toBeGreaterThan(0)
  for (const name of ["Workspace settings", "Visual Composer"]) {
    await page.evaluate(() => window.scrollTo(0, 0))
    const section = page.getByRole("region", { name, exact: true })
    const intro = section.locator(":scope > div").first()
    await expect(intro).toHaveCSS("position", "static")
    expect(await intro.evaluate((element) => {
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        if (["sticky", "fixed"].includes(getComputedStyle(ancestor).position)) return false
      }
      return true
    })).toBe(true)
    const introBox = await bounds(intro)
    const scroll = Math.min(120, maxScroll)
    await page.evaluate((y) => window.scrollTo(0, y), scroll)
    await expect.poll(async () => Math.abs((await bounds(intro)).y - introBox.y + scroll)).toBeLessThanOrEqual(1)
  }
  expect(await page.locator("main").evaluate((main) =>
    [main, ...main.querySelectorAll("form, section")].every((element) =>
      !["auto", "scroll", "hidden"].includes(getComputedStyle(element).overflowY)
    )
  )).toBe(true)
  expect(await page.evaluate(() => document.scrollingElement === document.documentElement)).toBe(true)
  await expect(page.getByRole("switch", { name: "Use dark mode" })).not.toBeChecked()
  await expect(page.getByLabel("Preview site URL")).toHaveValue("https://draft.example.com/editor")
  expect(writes).toEqual([])
})

test("shows loading before displaying editable settings", async ({ page }) => {
  let intercept!: (route: Route) => void
  const intercepted = new Promise<Route>((resolve) => { intercept = resolve })
  await page.route("**/api/internal/settings", (route) => intercept(route))
  await page.goto("/settings")
  const pending = await intercepted
  await expect(page.getByRole("status").filter({ hasText: "Loading settings" })).toBeVisible()
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-size", "36px")
  await expect(page.getByRole("switch")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Save settings" })).toHaveCount(0)
  await pending.fulfill({ json: initialSettings })
  await expect(page.getByRole("region", { name: "Workspace settings" })).toBeVisible()
  await expect(page.getByRole("status")).toHaveCount(0)
})

test("load failure keeps settings unavailable rather than showing a form", async ({ page }) => {
  await page.route("**/api/internal/settings", (route) =>
    route.fulfill({ status: 503, json: { error: "Settings are temporarily unavailable." } })
  )
  await page.goto("/settings")
  await expect(page.getByRole("alert")).toContainText("Settings unavailable")
  await expect(page.getByRole("alert")).toContainText("Settings are temporarily unavailable.")
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("font-size", "36px")
  await expect(page.getByRole("switch")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Save settings" })).toHaveCount(0)
})

for (const succeeds of [true, false]) {
  test(`pending save ${succeeds ? "succeeds" : "fails without losing drafts"}`, async ({ page }) => {
    let intercept!: (route: Route) => void
    const intercepted = new Promise<Route>((resolve) => { intercept = resolve })
    await page.route("**/api/internal/settings", (route) => {
      if (route.request().method() === "PUT") return intercept(route)
      return route.fulfill({ json: initialSettings })
    })
    await page.goto("/settings")
    await page.getByRole("switch", { name: "Use dark mode" }).click()
    await page.getByLabel("Preview site URL").fill("https://draft.example.com/editor")
    await page.getByRole("button", { name: "Save settings" }).click()
    const pending = await intercepted
    await expect(page.getByRole("button", { name: "Saving" })).toBeDisabled()
    expect(pending.request().postDataJSON()).toEqual({ themeMode: "light", visualComposerUrl: "https://draft.example.com/editor" })
    await pending.fulfill(succeeds
      ? { json: { ...initialSettings, themeMode: "light", visualComposerUrl: "https://draft.example.com/editor" } }
      : { status: 503, json: { error: "Please try saving again." } }
    )
    await expect(page.getByRole("button", { name: "Save settings" })).toBeEnabled()
    await expect(page.getByRole("switch", { name: "Use dark mode" })).not.toBeChecked()
    await expect(page.getByLabel("Preview site URL")).toHaveValue("https://draft.example.com/editor")
    if (succeeds) {
      await expect(page.getByText("Settings saved. Your workspace and visual composer are up to date.")).toBeVisible()
      await expect(page.locator("html")).not.toHaveClass(/dark/)
    } else {
      await expect(page.getByRole("alert")).toContainText("Settings unavailable")
      await expect(page.getByRole("alert")).toContainText("Please try saving again.")
      await expect(page.getByText("Settings saved. Your workspace and visual composer are up to date.")).toHaveCount(0)
      await expect(page.locator("html")).toHaveClass(/dark/)
    }
  })
}

test("preview link follows only valid HTTP and HTTPS draft URLs", async ({ page }) => {
  await page.goto("/settings")
  const url = page.getByLabel("Preview site URL")
  const link = page.getByRole("link", { name: "Test preview site" })
  for (const value of ["http://preview.example.com", "https://preview.example.com/editor"]) {
    await url.fill(value)
    await expect(link).toHaveAttribute("href", value)
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", "noreferrer")
  }
  for (const value of ["", "preview.example.com", "ftp://preview.example.com", "javascript:alert(1)"]) {
    await url.fill(value)
    await expect(link).toHaveCount(0)
  }
})

test("preserves native URL constraints and supports valid Enter submission", async ({ page }) => {
  const writes: string[] = []
  page.on("request", (request) => {
    if (request.url().endsWith("/api/internal/settings") && request.method() === "PUT") writes.push("PUT")
  })
  await page.goto("/settings")
  const url = page.getByLabel("Preview site URL")
  await expect(url).toHaveAttribute("type", "url")
  await expect(url).toHaveAttribute("maxlength", "2048")
  await url.fill("preview.example.com")
  await page.getByRole("button", { name: "Save settings" }).click()
  expect(await url.evaluate((element) => (element as HTMLInputElement).validity.typeMismatch)).toBe(true)
  await expect(url).toHaveValue("preview.example.com")
  await expect(page.getByText("Settings saved. Your workspace and visual composer are up to date.")).toHaveCount(0)
  expect(writes).toEqual([])
  await url.fill("https://preview.example.com/editor")
  await url.press("Enter")
  await expect(page.getByText("Settings saved. Your workspace and visual composer are up to date.")).toBeVisible()
  expect(writes).toEqual(["PUT"])
})

for (const themeMode of ["light", "dark"] as const) {
  test(`keyboard editing and saving in the ${themeMode} theme`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 375, height: 812 })
    let savedBody: unknown
    await page.route("**/api/internal/settings", (route) => {
      if (route.request().method() === "PUT") {
        savedBody = route.request().postDataJSON()
        return route.fulfill({ json: { ...initialSettings, ...savedBody as object } })
      }
      return route.fulfill({ json: { ...initialSettings, themeMode } })
    })
    await page.goto("/settings")
    const toggle = page.getByRole("switch", { name: "Use dark mode" })
    const save = page.getByRole("button", { name: "Save settings" })
    await save.focus()
    await page.keyboard.press("Tab")
    await expect(toggle).toBeFocused()
    await page.keyboard.press("Space")
    await expect(toggle).toHaveAttribute("aria-checked", themeMode === "light" ? "true" : "false")
    await page.keyboard.press("Tab")
    const url = page.getByLabel("Preview site URL")
    await expect(url).toBeFocused()
    expect(await url.evaluate((element) => parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2)
    await expect(url).not.toHaveCSS("outline-style", "none")
    await page.keyboard.press("ControlOrMeta+A")
    await page.keyboard.insertText("https://keyboard.example.com/editor")
    const screenshot = testInfo.outputPath("keyboard-focus.png")
    await page.screenshot({ path: screenshot, fullPage: true })
    await testInfo.attach("keyboard-focus", { path: screenshot, contentType: "image/png" })
    await page.keyboard.press("Tab")
    await expect(page.getByRole("link", { name: "Test preview site" })).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(url).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(toggle).toBeFocused()
    await page.keyboard.press("Shift+Tab")
    await expect(save).toBeFocused()
    await page.keyboard.press("Enter")
    await expect(page.getByText("Settings saved. Your workspace and visual composer are up to date.")).toBeVisible()
    expect(savedBody).toEqual({ themeMode: themeMode === "light" ? "dark" : "light", visualComposerUrl: "https://keyboard.example.com/editor" })
  })
}
