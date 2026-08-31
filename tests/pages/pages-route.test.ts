import { compileBlockDefinition } from "@/blocks/core/compiler"
import { createBlockRegistry } from "@/blocks/core/registry"
import type { Page, PageRepository } from "@/pages/core/page"
import { createPagesPostHandler } from "../../src/routes/api/internal/pages"

const registry = createBlockRegistry([
  compileBlockDefinition({
    name: "Hero",
    metadata: { label: "Hero" },
    fields: [{ key: "title", type: "text", label: "Title", default: "" }],
    allowedChildren: false,
  }),
])
const blocks = [
  { id: "hero-1", type: "Hero", parentId: null, content: { title: "Welcome" } },
]

class RecordingPageRepository implements PageRepository {
  readonly pages: Page[] = []
  async create(page: Page): Promise<void> {
    this.pages.push(page)
  }
}

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/internal/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("pages POST handler", () => {
  test("validates and persists creator-authored blocks", async () => {
    const repository = new RecordingPageRepository()
    const handler = createPagesPostHandler({
      loadRegistry: async () => registry,
      repository,
    })

    const response = await handler(createRequest({ blocks }))

    expect(response.status).toBe(201)
    expect(repository.pages).toHaveLength(1)
    expect(repository.pages[0]).toMatchObject({ blocks })
  })

  test("rejects a missing block collection before persistence", async () => {
    const repository = new RecordingPageRepository()
    const handler = createPagesPostHandler({
      loadRegistry: async () => registry,
      repository,
    })

    const response = await handler(createRequest({}))

    expect(response.status).toBe(400)
    expect(repository.pages).toEqual([])
  })

  test("rejects unknown block types before persistence", async () => {
    const repository = new RecordingPageRepository()
    const handler = createPagesPostHandler({
      loadRegistry: async () => registry,
      repository,
    })

    const response = await handler(
      createRequest({
        blocks: [{ ...blocks[0], type: "Unknown" }],
      })
    )

    expect(response.status).toBe(400)
    expect(repository.pages).toEqual([])
  })

  test("does not report success when persistence fails", async () => {
    const handler = createPagesPostHandler({
      loadRegistry: async () => registry,
      repository: {
        create: async () => {
          throw new Error("database unavailable")
        },
      },
    })

    const response = await handler(createRequest({ blocks }))

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: "The page could not be saved." })
  })
})
