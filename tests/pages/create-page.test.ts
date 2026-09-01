import type { Page, PageRepository } from "@/pages/core/page"
import { createPage } from "@/pages/server/create-page"

class RecordingPageRepository implements PageRepository {
  readonly pages: Page[] = []

  async create(page: Page): Promise<void> {
    this.pages.push(page)
  }
}

const blocks = [
  {
    id: "hero-1",
    type: "Hero",
    parentId: null,
    content: { title: "Welcome" },
  },
]

describe("page creation", () => {
  test("persists a complete page before returning it", async () => {
    const repository = new RecordingPageRepository()
    const createdAt = new Date("2026-08-31T10:00:00.000Z")

    const page = await createPage(
      { blocks },
      repository,
      { createId: () => "page-1", now: () => createdAt }
    )

    expect(page).toEqual({
      id: "page-1",
      alias: null,
      blocks,
      createdAt,
    })
    expect(repository.pages).toEqual([page])
  })

  test("persists a normalized page alias", async () => {
    const repository = new RecordingPageRepository()

    const page = await createPage(
      { blocks, alias: "  home  " },
      repository,
      { createId: () => "page-1", now: () => new Date() }
    )

    expect(page.alias).toBe("home")
    expect(repository.pages[0]?.alias).toBe("home")
  })

  test("stores a blank alias as null", async () => {
    const repository = new RecordingPageRepository()

    const page = await createPage({ blocks, alias: "   " }, repository)

    expect(page.alias).toBeNull()
  })

  test("does not report success when persistence fails", async () => {
    const repository: PageRepository = {
      create: async () => {
        throw new Error("database unavailable")
      },
    }

    await expect(
      createPage({ blocks }, repository)
    ).rejects.toThrow("database unavailable")
  })
})
