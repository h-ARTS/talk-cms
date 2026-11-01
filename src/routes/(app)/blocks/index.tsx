import { createFileRoute } from "@tanstack/react-router"
import BlockDefinitionsPage from "@/blocks/management/BlockDefinitionsPage"
import DashboardShell from "@/components/DashboardShell"
import PageLayout from "@/components/PageLayout"

export const Route = createFileRoute("/(app)/blocks/")({
  component: BlocksPage,
})

function BlocksPage() {
  return (
    <DashboardShell>
      <PageLayout>
        <BlockDefinitionsPage />
      </PageLayout>
    </DashboardShell>
  )
}
