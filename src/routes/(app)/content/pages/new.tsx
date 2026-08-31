import { createFileRoute } from "@tanstack/react-router"
import VisualComposer from "@/components/VisualComposer"

export const Route = createFileRoute("/(app)/content/pages/new")({
  component: NewPageComposer,
})

function NewPageComposer() {
  return <VisualComposer />
}
