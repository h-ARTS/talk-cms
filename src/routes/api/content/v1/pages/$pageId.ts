import { createFileRoute } from "@tanstack/react-router"
import type { PageReader } from "@/pages/core/page"
import { createPageSlug, parsePageSlug } from "@/pages/core/page-slug"
import { getPageReader } from "@/pages/server/mongodb-page-repository"

type PageGetDependencies = {
  reader: PageReader
}

const CORS_HEADERS = { "Access-Control-Allow-Origin": "*" }

export const Route = createFileRoute("/api/content/v1/pages/$pageId")({
  server: {
    handlers: {
      GET: ({ params }) => createPageGetHandler()(params.pageId),
    },
  },
})

export function createPageGetHandler(dependencies?: PageGetDependencies) {
  return async (pageIdOrSlug: string): Promise<Response> => {
    try {
      const pageId = parsePageSlug(pageIdOrSlug)
      if (!pageId) {
        return Response.json(
          { error: "Page not found" },
          { status: 404, headers: CORS_HEADERS }
        )
      }

      // Saved pages remain readable until publish-state gating is introduced.
      const page = await (dependencies?.reader ?? getPageReader()).findById(pageId)
      if (!page) {
        return Response.json(
          { error: "Page not found" },
          { status: 404, headers: CORS_HEADERS }
        )
      }

      return Response.json(
        { ...page, slug: createPageSlug(page) },
        { headers: CORS_HEADERS }
      )
    } catch (error) {
      console.error("Failed to load page:", error)
      return Response.json(
        { error: "The page could not be loaded." },
        { status: 500, headers: CORS_HEADERS }
      )
    }
  }
}
