import type { Page, PageReader } from "@/pages/core/page"
import { createPageGetHandler } from "../../src/routes/api/content/v1/pages/$pageId"

const page: Page = {
  id: "5df82e90-1887-4c0b-8ea3-0b3f6145ca12",
  name: "home",
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
      slug: `${page.id}-home`,
      createdAt: page.createdAt.toISOString(),
    })
  })

  test("returns a saved page by combined slug", async () => {
    const reader = createReader(async (id) => (id === page.id ? page : null))

    const response = await createPageGetHandler({ reader })(
      `${page.id}-home-page-v2`
    )

    expect(response.status).toBe(200)
    expect(await response.json()).toMatchObject({ id: page.id })
  })

  test("returns 404 for a slug without a page id", async () => {
    const reader = createReader(async () => null)

    const response = await createPageGetHandler({ reader })("home-page-v2")

    expect(response.status).toBe(404)
    expect(await response.json()).toEqual({ error: "Page not found" })
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
