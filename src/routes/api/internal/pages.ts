import { createFileRoute } from "@tanstack/react-router"
import { compileBlockDefinition } from "@/blocks/core/compiler"
import { createBlockRegistry, type BlockRegistry } from "@/blocks/core/registry"
import { validateStoredBlocks } from "@/blocks/core/validation"
import { listBlockDescriptors } from "@/blocks/server/definition-store"
import type { PageRepository } from "@/pages/core/page"
import { createPage } from "@/pages/server/create-page"
import { getPageRepository } from "@/pages/server/mongodb-page-repository"

type PagesPostDependencies = {
  loadRegistry: () => Promise<BlockRegistry>
  repository: PageRepository
}

export const Route = createFileRoute("/api/internal/pages")({
  server: {
    handlers: {
      POST: ({ request }) => createPagesPostHandler()(request),
    },
  },
})

export function createPagesPostHandler(dependencies?: PagesPostDependencies) {
  return async (request: Request): Promise<Response> => {
    try {
      const requestBody: unknown = await request.json()
      const blocks = isRecord(requestBody) ? requestBody.blocks : undefined
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

async function loadRegistry(): Promise<BlockRegistry> {
  const descriptors = await listBlockDescriptors()
  return createBlockRegistry(descriptors.map(compileBlockDefinition))
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
