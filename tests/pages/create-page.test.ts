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
      blocks,
      createdAt,
    })
    expect(repository.pages).toEqual([page])
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
