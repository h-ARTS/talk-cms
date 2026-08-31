import { createFileRoute } from "@tanstack/react-router"
import BlockDefinitionsPage from "@/blocks/management/BlockDefinitionsPage"
import DashboardShell from "@/components/DashboardShell"

export const Route = createFileRoute("/(app)/blocks/")({
  component: BlocksPage,
})

function BlocksPage() {
  return (
    <DashboardShell>
      <BlockDefinitionsPage />
    </DashboardShell>
  )
}
