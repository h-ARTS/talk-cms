import { createFileRoute } from "@tanstack/react-router"
import { Box, Container, Typography } from "@mui/material"
import DashboardShell from "@/components/DashboardShell"

export const Route = createFileRoute("/(app)/")({
  component: DashboardPage,
})

function DashboardPage() {
  return (
    <DashboardShell>
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Box sx={{ maxWidth: 640 }}>
          <Typography variant="overline" color="text.secondary">Workspace</Typography>
          <Typography variant="h3" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>Dashboard</Typography>
          <Typography color="text.secondary">
            Choose Pages or Block definitions from the navigation to manage your content.
          </Typography>
        </Box>
      </Container>
    </DashboardShell>
  )
}
