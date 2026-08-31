import { createFileRoute } from "@tanstack/react-router"
import { compileBlockDefinition } from "@/blocks/core/compiler"
import { createBlockRegistry, type BlockRegistry } from "@/blocks/core/registry"
import { validateStoredBlocks } from "@/blocks/core/validation"
import { listBlockDescriptors } from "@/blocks/server/definition-store"
import type {
  PageDeleter,
  PageLister,
  PageRepository,
  PageUpdater,
} from "@/pages/core/page"
import { createPage } from "@/pages/server/create-page"
import {
  getPageLister,
  getPageDeleter,
  getPageRepository,
  getPageUpdater,
} from "@/pages/server/mongodb-page-repository"

type PagesPostDependencies = {
  loadRegistry: () => Promise<BlockRegistry>
  repository: PageRepository
}

type PagesGetDependencies = {
  pageLister: PageLister
}

type PagesPutDependencies = {
  loadRegistry: () => Promise<BlockRegistry>
  pageUpdater: PageUpdater
}

type PagesDeleteDependencies = {
  pageDeleter: PageDeleter
}

export const Route = createFileRoute("/api/internal/pages")({
  server: {
    handlers: {
      GET: () => createPagesGetHandler()(),
      POST: ({ request }) => createPagesPostHandler()(request),
      PUT: ({ request }) => createPagesPutHandler()(request),
      DELETE: ({ request }) => createPagesDeleteHandler()(request),
    },
  },
})

export function createPagesGetHandler(dependencies?: PagesGetDependencies) {
  return async (): Promise<Response> => {
    try {
      const pages = await (dependencies?.pageLister ?? getPageLister()).list()
      return Response.json(pages)
    } catch (error) {
      console.error("Failed to list pages:", error)
      return Response.json(
        { error: "The pages could not be loaded." },
        { status: 500 }
      )
    }
  }
}

export function createPagesPostHandler(dependencies?: PagesPostDependencies) {
  return async (request: Request): Promise<Response> => {
    try {
      const requestBody = await readRequestBody(request)
      if (!requestBody.success) return requestBody.response
      const blocks = isRecord(requestBody.value) ? requestBody.value.blocks : undefined
      const registry = await (dependencies?.loadRegistry ?? loadRegistry)()
      const validationResult = validateStoredBlocks(blocks, registry)

      if (!validationResult.success) {
        return Response.json({ error: validationResult.message }, { status: 400 })
      }

      const page = await createPage(
        { blocks: validationResult.data },
        dependencies?.repository ?? getPageRepository()
      )
      return Response.json(page, { status: 201 })
    } catch (error) {
      console.error("Failed to create page:", error)
      return Response.json({ error: "The page could not be saved." }, { status: 500 })
    }
  }
}

export function createPagesPutHandler(dependencies?: PagesPutDependencies) {
  return async (request: Request): Promise<Response> => {
    try {
      const pageId = readPageId(request)
      if (!pageId) return missingPageIdResponse()

      const requestBody = await readRequestBody(request)
      if (!requestBody.success) return requestBody.response
      const blocks = isRecord(requestBody.value) ? requestBody.value.blocks : undefined
      const registry = await (dependencies?.loadRegistry ?? loadRegistry)()
      const validationResult = validateStoredBlocks(blocks, registry)
      if (!validationResult.success) {
        return Response.json({ error: validationResult.message }, { status: 400 })
      }

      const updated = await (dependencies?.pageUpdater ?? getPageUpdater()).update(
        pageId,
        validationResult.data
      )
      if (!updated) return Response.json({ error: "Page not found" }, { status: 404 })
      return new Response(null, { status: 204 })
    } catch (error) {
      console.error("Failed to update page:", error)
      return Response.json({ error: "The page could not be updated." }, { status: 500 })
    }
  }
}

export function createPagesDeleteHandler(dependencies?: PagesDeleteDependencies) {
  return async (request: Request): Promise<Response> => {
    try {
      const pageId = readPageId(request)
      if (!pageId) return missingPageIdResponse()

      const deleted = await (dependencies?.pageDeleter ?? getPageDeleter()).delete(pageId)
      if (!deleted) return Response.json({ error: "Page not found" }, { status: 404 })
      return new Response(null, { status: 204 })
    } catch (error) {
      console.error("Failed to delete page:", error)
      return Response.json({ error: "The page could not be deleted." }, { status: 500 })
    }
  }
}

async function loadRegistry(): Promise<BlockRegistry> {
  const descriptors = await listBlockDescriptors()
  return createBlockRegistry(descriptors.map(compileBlockDefinition))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readPageId(request: Request): string | null {
  return new URL(request.url).searchParams.get("id")?.trim() || null
}

function missingPageIdResponse(): Response {
  return Response.json({ error: "Page ID is required" }, { status: 400 })
}

async function readRequestBody(
  request: Request
): Promise<{ success: true; value: unknown } | { success: false; response: Response }> {
  try {
    return { success: true, value: await request.json() }
  } catch {
    return {
      success: false,
      response: Response.json({ error: "A valid JSON body is required" }, { status: 400 }),
    }
  }
}
