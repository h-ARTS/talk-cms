import { Alert, Box } from "@mui/material"
import type { BlockDefinition } from "../definition"
import BlockField from "./BlockField"

type GenericBlockEditorProps = {
  definition: BlockDefinition
  content: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export default function GenericBlockEditor({
  definition,
  content,
  onChange,
}: GenericBlockEditorProps) {
  const validation = definition.schema.safeParse(content)

  return (
    <Box sx={{ px: 3 }}>
      {!validation.success && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          This block contains values that do not match its definition.
        </Alert>
      )}
      {Object.entries(definition.inputs).map(([name, input]) => (
        <BlockField
          key={name}
          name={name}
          input={input}
          value={content[name]}
          onChange={(fieldName, value) =>
            onChange({ ...content, [fieldName]: value })
          }
        />
      ))}
    </Box>
  )
}
