import { createFileRoute } from "@tanstack/react-router"
import type { PageReader } from "@/pages/core/page"
import { getPageReader } from "@/pages/server/mongodb-page-repository"

type PageGetDependencies = {
  reader: PageReader
}

export const Route = createFileRoute("/api/content/v1/pages/$pageId")({
  server: {
    handlers: {
      GET: ({ params }) => createPageGetHandler()(params.pageId),
    },
  },
})

export function createPageGetHandler(dependencies?: PageGetDependencies) {
  return async (pageId: string): Promise<Response> => {
    try {
      // Saved pages remain readable until publish-state gating is introduced.
      const page = await (dependencies?.reader ?? getPageReader()).findById(pageId)
      if (!page) {
        return Response.json({ error: "Page not found" }, { status: 404 })
      }

      return Response.json(page)
    } catch (error) {
      console.error("Failed to load page:", error)
      return Response.json(
        { error: "The page could not be loaded." },
        { status: 500 }
      )
    }
  }
}
