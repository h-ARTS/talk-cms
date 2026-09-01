import { useEffect, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Link as MuiLink,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import DashboardShell from "@/components/DashboardShell"
import IconButtonLink from "@/components/IconButtonLink"
import { deletePage, listPages, type SavedPage } from "@/pages/client/page-api"

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
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "flex-end" }, gap: 3, mb: 5, flexDirection: { xs: "column", sm: "row" } }}>
          <Box>
            <Typography variant="overline" color="text.secondary">Content</Typography>
            <Typography variant="h3" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>Pages</Typography>
            <Typography color="text.secondary">Create a page or open saved content in the visual composer.</Typography>
          </Box>
          <Button component={Link} to="/content/pages/new" variant="contained" startIcon={<AddIcon />}>
            Create page
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {message && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage(null)}>{message}</Alert>}
        <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
          <Table aria-label="Saved pages">
            <TableHead>
              <TableRow>
                <TableCell>Page ID</TableCell>
                <TableCell>Alias</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Blocks</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 7 }}><CircularProgress size={28} /></TableCell></TableRow>
              )}
              {!loading && !error && pages.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 7 }}><Typography color="text.secondary">No saved pages yet.</Typography></TableCell></TableRow>
              )}
              {!loading && pages.map((page) => (
                <TableRow key={page.id} hover data-testid={`page-row-${page.id}`}>
                  <TableCell>
                    <Link to="/content/pages/$pageId" params={{ pageId: page.id }} style={{ color: "inherit" }}>
                      <MuiLink component="span" underline="hover" sx={{ fontWeight: 600 }}>{page.id}</MuiLink>
                    </Link>
                  </TableCell>
                  <TableCell>{page.alias ?? "—"}</TableCell>
                  <TableCell>{formatDate(page.createdAt)}</TableCell>
                  <TableCell align="right">{page.blocks.length}</TableCell>
                  <TableCell align="right">
                    <IconButtonLink
                      to="/content/pages/$pageId"
                      params={{ pageId: page.id }}
                      aria-label={`Edit page ${page.id}`}
                    >
                      <EditOutlinedIcon fontSize="small" />
                    </IconButtonLink>
                    <IconButton
                      color="error"
                      aria-label={`Delete page ${page.id}`}
                      disabled={deletingPageId !== null}
                      onClick={() => void removePage(page)}
                      data-testid={`page-delete-${page.id}`}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </DashboardShell>
  )
}

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}
