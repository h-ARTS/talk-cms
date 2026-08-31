import type { Page, PageReader } from "@/pages/core/page"
import { createPageGetHandler } from "../../src/routes/api/content/v1/pages/$pageId"

const page: Page = {
  id: "page-1",
  blocks: [
    {
      id: "hero-1",
      type: "Hero",
      parentId: null,
      content: { title: "Welcome" },
    },
  ],
  createdAt: new Date("2026-08-31T10:00:00.000Z"),
}

function createReader(findById: PageReader["findById"]): PageReader {
  return { findById }
}

describe("public content page GET handler", () => {
  test("returns a saved page by ID", async () => {
    const reader = createReader(async (id) => (id === page.id ? page : null))

    const response = await createPageGetHandler({ reader })(page.id)

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      ...page,
      createdAt: page.createdAt.toISOString(),
    })
  })

  test("returns 404 when the page does not exist", async () => {
    const reader = createReader(async () => null)

    const response = await createPageGetHandler({ reader })("missing-page")

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Page not found" })
  })

  test("returns a generic 500 response when loading fails", async () => {
    const reader = createReader(async () => {
      throw new Error("database unavailable")
    })

    const response = await createPageGetHandler({ reader })(page.id)

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({
      error: "The page could not be loaded.",
    })
  })
})
