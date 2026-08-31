import { useState } from "react"
import AddIcon from "@mui/icons-material/Add"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined"
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import {
  parseBlockDescriptor,
  type BlockDescriptor,
  type FieldDescriptor,
} from "../core/descriptor"

type BlockDefinitionFormProps = {
  definition: BlockDescriptor | null
  availableBlocks: readonly BlockDescriptor[]
  saving: boolean
  onSave: (descriptor: BlockDescriptor) => Promise<void>
  onCancel: () => void
}

type FieldDraft = {
  key: string
  label: string
  type: FieldDescriptor["type"]
  defaultValue: string | boolean
  description: string
  min: string
  max: string
}

const emptyField = (): FieldDraft => ({
  key: "",
  label: "",
  type: "text",
  defaultValue: "",
  description: "",
  min: "",
  max: "",
})

export default function BlockDefinitionForm({
  definition,
  availableBlocks,
  saving,
  onSave,
  onCancel,
}: BlockDefinitionFormProps) {
  const [name, setName] = useState(definition?.name ?? "")
  const [label, setLabel] = useState(definition?.metadata.label ?? "")
  const [description, setDescription] = useState(
    definition?.metadata.description ?? ""
  )
  const [category, setCategory] = useState(
    definition?.metadata.category ?? ""
  )
  const [childMode, setChildMode] = useState<"none" | "any" | "specific">(
    definition?.allowedChildren === true
      ? "any"
      : Array.isArray(definition?.allowedChildren)
        ? "specific"
        : "none"
  )
  const [allowedChildren, setAllowedChildren] = useState<string[]>(
    Array.isArray(definition?.allowedChildren)
      ? [...definition.allowedChildren]
      : []
  )
  const [fields, setFields] = useState<FieldDraft[]>(
    definition ? definition.fields.map(toFieldDraft) : [emptyField()]
  )
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const candidate = {
      name,
      metadata: {
        label,
        description: description || undefined,
        category: category || undefined,
      },
      fields: fields.map(toFieldDescriptor),
      allowedChildren:
        childMode === "any"
          ? true
          : childMode === "specific"
            ? allowedChildren
            : false,
    }
    const parsed = parseBlockDescriptor(candidate)
    if (!parsed.success) {
      setError(parsed.message)
      return
    }

    setError(null)
    try {
      await onSave(parsed.data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save block")
    }
  }

  return (
    <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        <Typography variant="overline" color="primary.main">
          {definition ? "Edit definition" : "New definition"}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, mb: 1 }}>
          {definition ? definition.metadata.label : "Create a content block"}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Describe the fields your marketing team will fill in when composing a page.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              required
              label="Technical name"
              value={name}
              disabled={Boolean(definition)}
              helperText="Stable identifier, for example HeroBanner"
              onChange={(event) => setName(event.target.value)}
              slotProps={{ htmlInput: { "data-testid": "block-name" } }}
            />
            <TextField
              fullWidth
              required
              label="Display name"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              slotProps={{ htmlInput: { "data-testid": "block-label" } }}
            />
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <TextField
            fullWidth
            label="Category"
            placeholder="Campaign, Editorial, Layout..."
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </Stack>

        <Divider sx={{ my: 4 }} />
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography variant="h6">Content fields</Typography>
            <Typography variant="body2" color="text.secondary">
              These become the inputs shown in the visual editor.
            </Typography>
          </Box>
          <Button
            startIcon={<AddIcon />}
            onClick={() => setFields((current) => [...current, emptyField()])}
            data-testid="add-field"
          >
            Add field
          </Button>
        </Stack>

        <Stack spacing={2}>
          {fields.map((field, index) => (
            <Paper
              key={index}
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2, bgcolor: "action.hover" }}
            >
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    required
                    fullWidth
                    label="Field key"
                    value={field.key}
                    onChange={(event) => updateField(index, { key: event.target.value }, setFields)}
                    slotProps={{ htmlInput: { "data-testid": `field-key-${index}` } }}
                  />
                  <TextField
                    required
                    fullWidth
                    label="Field label"
                    value={field.label}
                    onChange={(event) => updateField(index, { label: event.target.value }, setFields)}
                    slotProps={{ htmlInput: { "data-testid": `field-label-${index}` } }}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Input type</InputLabel>
                    <Select
                      label="Input type"
                      value={field.type}
                      onChange={(event) =>
                        updateField(
                          index,
                          {
                            type: event.target.value as FieldDescriptor["type"],
                            defaultValue: event.target.value === "boolean" ? false : "",
                          },
                          setFields
                        )
                      }
                      inputProps={{ "data-testid": `field-type-${index}` }}
                    >
                      <MenuItem value="text">Short text</MenuItem>
                      <MenuItem value="textarea">Long text</MenuItem>
                      <MenuItem value="url">URL</MenuItem>
                      <MenuItem value="color">Color</MenuItem>
                      <MenuItem value="number">Number</MenuItem>
                      <MenuItem value="boolean">Toggle</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    color="error"
                    aria-label={`Remove field ${index + 1}`}
                    onClick={() => setFields((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    <DeleteOutlineIcon />
                  </Button>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  {field.type === "boolean" ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={field.defaultValue === true}
                          onChange={(event) =>
                            updateField(index, { defaultValue: event.target.checked }, setFields)
                          }
                        />
                      }
                      label="Enabled by default"
                    />
                  ) : (
                    <TextField
                      fullWidth
                      label="Default value"
                      type={field.type === "number" ? "number" : "text"}
                      value={field.defaultValue}
                      onChange={(event) =>
                        updateField(index, { defaultValue: event.target.value }, setFields)
                      }
                      slotProps={{ htmlInput: { "data-testid": `field-default-${index}` } }}
                    />
                  )}
                  {field.type === "number" && (
                    <>
                      <TextField
                        label="Minimum"
                        type="number"
                        value={field.min}
                        onChange={(event) => updateField(index, { min: event.target.value }, setFields)}
                      />
                      <TextField
                        label="Maximum"
                        type="number"
                        value={field.max}
                        onChange={(event) => updateField(index, { max: event.target.value }, setFields)}
                      />
                    </>
                  )}
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Nested blocks</Typography>
        <FormControl fullWidth>
          <InputLabel>Allowed children</InputLabel>
          <Select
            value={childMode}
            label="Allowed children"
            onChange={(event) => setChildMode(event.target.value as typeof childMode)}
          >
            <MenuItem value="none">No nested blocks</MenuItem>
            <MenuItem value="any">Any defined block</MenuItem>
            <MenuItem value="specific">Specific blocks</MenuItem>
          </Select>
        </FormControl>
        {childMode === "specific" && (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Block types</InputLabel>
            <Select
              multiple
              value={allowedChildren}
              label="Block types"
              onChange={(event) =>
                setAllowedChildren(
                  typeof event.target.value === "string"
                    ? event.target.value.split(",")
                    : event.target.value
                )
              }
            >
              {availableBlocks
                .filter((candidate) => candidate.name !== definition?.name)
                .map((candidate) => (
                  <MenuItem key={candidate.name} value={candidate.name}>
                    {candidate.metadata.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        )}

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end", mt: 4 }}>
          {definition && <Button onClick={onCancel}>Cancel</Button>}
          <Button
            variant="contained"
            size="large"
            disabled={saving}
            onClick={() => void submit()}
            data-testid="save-block-definition"
          >
            {saving ? "Saving..." : definition ? "Save changes" : "Create block"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}

function updateField(
  index: number,
  update: Partial<FieldDraft>,
  setFields: React.Dispatch<React.SetStateAction<FieldDraft[]>>
) {
  setFields((current) =>
    current.map((field, fieldIndex) =>
      fieldIndex === index ? { ...field, ...update } : field
    )
  )
}

function toFieldDraft(field: FieldDescriptor): FieldDraft {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    defaultValue:
      typeof field.default === "number" ? String(field.default) : field.default,
    description: field.description ?? "",
    min: field.type === "number" && field.min !== undefined ? String(field.min) : "",
    max: field.type === "number" && field.max !== undefined ? String(field.max) : "",
  }
}

function toFieldDescriptor(field: FieldDraft): unknown {
  const common = {
    key: field.key,
    label: field.label,
    type: field.type,
    description: field.description || undefined,
  }
  if (field.type === "boolean") return { ...common, default: field.defaultValue === true }
  if (field.type === "number") {
    return {
      ...common,
      default: Number(field.defaultValue),
      min: field.min === "" ? undefined : Number(field.min),
      max: field.max === "" ? undefined : Number(field.max),
    }
  }
  return { ...common, default: String(field.defaultValue) }
}
