import { createFileRoute } from "@tanstack/react-router"
import VisualComposer from "@/components/VisualComposer"

export const Route = createFileRoute("/(app)/content/pages/$pageId")({
  component: SavedPageComposer,
})

function SavedPageComposer() {
  const { pageId } = Route.useParams()
  return <VisualComposer key={pageId} pageId={pageId} />
}
