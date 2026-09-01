import { compileBlockDefinition } from "@/blocks/core/compiler"
import { createBlockRegistry } from "@/blocks/core/registry"
import type { Page, PageRepository } from "@/pages/core/page"
import {
  createPagesDeleteHandler,
  createPagesGetHandler,
  createPagesPostHandler,
  createPagesPutHandler,
} from "../../src/routes/api/internal/pages"

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

function createRequest(
  body: unknown,
  method = "POST",
  query = ""
): Request {
  return new Request(`http://localhost/api/internal/pages${query}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
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
    expect(repository.pages[0]).toMatchObject({ blocks, alias: null })
  })

  test("persists a normalized page alias", async () => {
    const repository = new RecordingPageRepository()
    const handler = createPagesPostHandler({
      loadRegistry: async () => registry,
      repository,
    })

    const response = await handler(createRequest({ blocks, alias: "  home " }))

    expect(response.status).toBe(201)
    expect(repository.pages[0]?.alias).toBe("home")
  })

  test("rejects a non-string alias before persistence", async () => {
    const repository = new RecordingPageRepository()
    const handler = createPagesPostHandler({
      loadRegistry: async () => registry,
      repository,
    })

    const response = await handler(createRequest({ blocks, alias: 42 }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "The page alias must be a string." })
    expect(repository.pages).toEqual([])
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

describe("pages GET handler", () => {
  test("returns saved pages", async () => {
    const pages: Page[] = [{ id: "page-1", alias: "home", blocks, createdAt: new Date("2026-08-31T10:00:00.000Z") }]
    const response = await createPagesGetHandler({ pageLister: { list: async () => pages } })()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual([
      { id: "page-1", alias: "home", blocks, createdAt: "2026-08-31T10:00:00.000Z" },
    ])
  })

  test("reports repository failures", async () => {
    const response = await createPagesGetHandler({
      pageLister: { list: async () => { throw new Error("database unavailable") } },
    })()

    expect(response.status).toBe(500)
    expect(await response.json()).toEqual({ error: "The pages could not be loaded." })
  })
})

describe("pages PUT handler", () => {
  test("validates and updates an existing page", async () => {
    let updatedPage: unknown
    const response = await createPagesPutHandler({
      loadRegistry: async () => registry,
      pageUpdater: {
        update: async (id, value) => {
          expect(id).toBe("page-1")
          updatedPage = value
          return true
        },
      },
    })(createRequest({ blocks, alias: "home" }, "PUT", "?id=page-1"))

    expect(response.status).toBe(204)
    expect(updatedPage).toEqual({ blocks, alias: "home" })
  })

  test("clears the alias when it is blank", async () => {
    let updatedPage: unknown
    const response = await createPagesPutHandler({
      loadRegistry: async () => registry,
      pageUpdater: {
        update: async (id, value) => {
          updatedPage = value
          return true
        },
      },
    })(createRequest({ blocks, alias: "  " }, "PUT", "?id=page-1"))

    expect(response.status).toBe(204)
    expect(updatedPage).toEqual({ blocks, alias: null })
  })

  test("rejects a non-string alias", async () => {
    const response = await createPagesPutHandler({
      loadRegistry: async () => registry,
      pageUpdater: { update: async () => true },
    })(createRequest({ blocks, alias: 42 }, "PUT", "?id=page-1"))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "The page alias must be a string." })
  })

  test("returns not found when the page does not exist", async () => {
    const response = await createPagesPutHandler({
      loadRegistry: async () => registry,
      pageUpdater: { update: async () => false },
    })(createRequest({ blocks }, "PUT", "?id=missing"))

    expect(response.status).toBe(404)
  })

  test("rejects malformed JSON", async () => {
    const response = await createPagesPutHandler({
      loadRegistry: async () => registry,
      pageUpdater: { update: async () => true },
    })(new Request("http://localhost/api/internal/pages?id=page-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: "{",
    }))

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ error: "A valid JSON body is required" })
  })

  test("reports repository failures", async () => {
    const response = await createPagesPutHandler({
      loadRegistry: async () => registry,
      pageUpdater: {
        update: async () => {
          throw new Error("database unavailable")
        },
      },
    })(createRequest({ blocks }, "PUT", "?id=page-1"))

    expect(response.status).toBe(500)
  })
})

describe("pages DELETE handler", () => {
  test("deletes an existing page", async () => {
    let deletedId: string | undefined
    const response = await createPagesDeleteHandler({
      pageDeleter: {
        delete: async (id) => {
          deletedId = id
          return true
        },
      },
    })(createRequest(undefined, "DELETE", "?id=page-1"))

    expect(response.status).toBe(204)
    expect(deletedId).toBe("page-1")
  })

  test("requires a page ID", async () => {
    const response = await createPagesDeleteHandler({
      pageDeleter: { delete: async () => true },
    })(createRequest(undefined, "DELETE"))

    expect(response.status).toBe(400)
  })

  test("returns not found when the page does not exist", async () => {
    const response = await createPagesDeleteHandler({
      pageDeleter: { delete: async () => false },
    })(createRequest(undefined, "DELETE", "?id=missing"))

    expect(response.status).toBe(404)
  })

  test("reports repository failures", async () => {
    const response = await createPagesDeleteHandler({
      pageDeleter: {
        delete: async () => {
          throw new Error("database unavailable")
        },
      },
    })(createRequest(undefined, "DELETE", "?id=page-1"))

    expect(response.status).toBe(500)
  })
})
