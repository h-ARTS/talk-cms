import { useState } from "react"
import { Link } from "@tanstack/react-router"
import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/index"
import { useBlockRegistry } from "../client/block-registry-context"
import {
  createDefinition,
  deleteDefinition,
  updateDefinition,
} from "../client/definition-api"
import type { BlockDescriptor } from "../core/descriptor"
import { compileBlockDefinition } from "../core/compiler"
import { createBlockRegistry } from "../core/registry"
import { validateStoredBlocks } from "../core/validation"
import BlockDefinitionForm from "./BlockDefinitionForm"

export default function BlockDefinitionsPage() {
  const { descriptors, loading, error, refresh } = useBlockRegistry()
  const contentBlocks = useSelector((state: RootState) => state.pageBuilder.blocks)
  const [selected, setSelected] = useState<BlockDescriptor | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const save = async (descriptor: BlockDescriptor) => {
    const usageCount = selected
      ? contentBlocks.filter(
          (block) => block.type.toLowerCase() === selected.name.toLowerCase()
        ).length
      : 0
    if (selected && usageCount > 0) {
      const prospectiveDescriptors = descriptors.map((candidate) =>
        candidate.name.toLowerCase() === selected.name.toLowerCase()
          ? descriptor
          : candidate
      )
      const validation = validateStoredBlocks(
        contentBlocks,
        createBlockRegistry(prospectiveDescriptors.map(compileBlockDefinition))
      )
      if (!validation.success) {
        throw new Error(
          `${selected.metadata.label} is used by ${usageCount} content ${usageCount === 1 ? "block" : "blocks"}. ${validation.message}`
        )
      }
    }

    setSaving(true)
    try {
      if (selected) await updateDefinition(descriptor)
      else await createDefinition(descriptor)
      await refresh()
      setSelected(null)
      setCreating(false)
      setMessage(`${descriptor.metadata.label} saved.`)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (descriptor: BlockDescriptor) => {
    const usageCount = contentBlocks.filter(
      (block) => block.type.toLowerCase() === descriptor.name.toLowerCase()
    ).length
    if (usageCount) {
      setMessage(
        `${descriptor.metadata.label} is used by ${usageCount} content ${usageCount === 1 ? "block" : "blocks"} and cannot be removed.`
      )
      return
    }
    if (!window.confirm(`Remove ${descriptor.metadata.label}?`)) return

    try {
      await deleteDefinition(descriptor.name)
      await refresh()
      if (selected?.name === descriptor.name) setSelected(null)
      setMessage(`${descriptor.metadata.label} removed.`)
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not remove block")
    }
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="header"
        sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}
      >
        <Container maxWidth="xl">
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", py: 2 }}>
            <Button component={Link} to="/" startIcon={<ArrowBackIcon />}>
              Page editor
            </Button>
            <Typography variant="subtitle2" color="text.secondary">
              Talk CMS · Content model
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 7 } }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          sx={{ justifyContent: "space-between", alignItems: { md: "flex-end" }, mb: 5 }}
        >
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="overline" color="primary.main">Content architecture</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: "2.4rem", md: "3.5rem" }, mb: 1.5 }}>
              Block definitions
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
              Build the reusable content shapes your marketing team uses to compose campaigns and landing pages.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelected(null)
              setCreating(true)
            }}
            data-testid="block-create-button"
          >
            Create definition
          </Button>
        </Stack>

        {(error || message) && (
          <Alert severity={error ? "error" : "info"} sx={{ mb: 3 }} onClose={() => setMessage(null)}>
            {error ?? message}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(320px, 0.8fr) minmax(560px, 1.6fr)" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6">Definition library</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {descriptors.length} {descriptors.length === 1 ? "block" : "blocks"} available
                  </Typography>
                </Box>
                <Inventory2OutlinedIcon color="action" />
              </Stack>
            </Box>

            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center", p: 6 }}><CircularProgress /></Box>
            ) : descriptors.length === 0 ? (
              <Box sx={{ p: 5, textAlign: "center" }} data-testid="empty-block-list">
                <Typography variant="h6" gutterBottom>No definitions yet</Typography>
                <Typography color="text.secondary">
                  Create your first block to make it available in the page editor.
                </Typography>
              </Box>
            ) : (
              <List disablePadding data-testid="block-list">
                {descriptors.map((descriptor) => (
                  <ListItem
                    key={descriptor.name}
                    divider
                    data-testid={`block-row-${descriptor.name}`}
                    secondaryAction={
                      <Stack direction="row">
                        <IconButton
                          aria-label={`Edit ${descriptor.metadata.label}`}
                          onClick={() => {
                            setCreating(false)
                            setSelected(descriptor)
                          }}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          aria-label={`Delete ${descriptor.metadata.label}`}
                          onClick={() => void remove(descriptor)}
                          data-testid={`block-delete-${descriptor.name}`}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Stack>
                    }
                    sx={{ px: 3, py: 2 }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                          <Typography sx={{ fontWeight: 700 }}>{descriptor.metadata.label}</Typography>
                          {descriptor.metadata.category && (
                            <Chip label={descriptor.metadata.category} size="small" variant="outlined" />
                          )}
                        </Stack>
                      }
                      secondary={`${descriptor.name} · ${descriptor.fields.length} fields`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {(creating || selected) ? (
            <BlockDefinitionForm
              key={selected?.name ?? "new-definition"}
              definition={selected}
              availableBlocks={descriptors}
              saving={saving}
              onSave={save}
              onCancel={() => {
                setSelected(null)
                setCreating(false)
              }}
            />
          ) : (
            <Paper
              elevation={0}
              sx={{ border: 1, borderStyle: "dashed", borderColor: "divider", borderRadius: 3, p: 7, textAlign: "center" }}
            >
              <Typography variant="h5" gutterBottom>Select a definition to edit</Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Or create a new reusable content block from scratch.
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
                Create definition
              </Button>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  )
}
