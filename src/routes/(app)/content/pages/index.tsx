import { useEffect, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { PlusIcon, Trash2Icon, PencilIcon } from "lucide-react"

import DashboardShell from "@/components/DashboardShell"
import IconButtonLink from "@/components/IconButtonLink"
import { deletePage, listPages, type SavedPage } from "@/pages/client/page-api"
import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"

export const Route = createFileRoute("/(app)/content/pages/")({
  component: PagesPage,
})

function PagesPage() {
  const [pages, setPages] = useState<SavedPage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [deletingPageId, setDeletingPageId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void listPages()
      .then((value) => {
        if (active) setPages(value)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "The pages could not be loaded.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const removePage = async (page: SavedPage) => {
    if (!window.confirm(`Delete page ${page.id}?`)) return

    setDeletingPageId(page.id)
    setError(null)
    setMessage(null)
    try {
      await deletePage(page.id)
      setPages((currentPages) => currentPages.filter((candidate) => candidate.id !== page.id))
      setMessage(`Page ${page.id} deleted.`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The page could not be deleted.")
    } finally {
      setDeletingPageId(null)
    }
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Content
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Pages</h1>
            <p className="mt-2 text-muted-foreground">
              Create a page or open saved content in the visual composer.
            </p>
          </div>
          <Button asChild>
            <Link to="/content/pages/new">
              <PlusIcon />
              Create page
            </Link>
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4" onClose={() => setError(null)}>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert variant="success" className="mb-4" onClose={() => setMessage(null)}>
            <AlertTitle>Done</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm" aria-label="Saved pages">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Page</th>
                <th className="px-5 py-3 font-medium">Created</th>
                <th className="px-5 py-3 text-right font-medium">Blocks</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <Spinner className="justify-center" />
                  </td>
                </tr>
              )}
              {!loading && !error && pages.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-muted-foreground">
                    No saved pages yet.
                  </td>
                </tr>
              )}
              {!loading &&
                pages.map((page) => (
                  <tr
                    key={page.id}
                    data-testid={`page-row-${page.id}`}
                    className="border-b border-border transition-colors duration-150 last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        to="/content/pages/$pageId"
                        params={{ pageId: page.id }}
                        className="font-medium text-foreground underline-offset-4 transition-colors duration-150 hover:text-primary hover:underline"
                      >
                        {page.name ?? page.id}
                      </Link>
                      {page.name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{page.id}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {formatDate(page.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{page.blocks.length}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconButtonLink
                          to="/content/pages/$pageId"
                          params={{ pageId: page.id }}
                          aria-label={`Edit page ${page.id}`}
                        >
                          <PencilIcon />
                        </IconButtonLink>
                        <button
                          type="button"
                          aria-label={`Delete page ${page.id}`}
                          disabled={deletingPageId !== null}
                          onClick={() => void removePage(page)}
                          data-testid={`page-delete-${page.id}`}
                          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4"
                        >
                          <Trash2Icon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardShell>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}
