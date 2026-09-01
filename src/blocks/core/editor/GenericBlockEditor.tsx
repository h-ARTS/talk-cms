import type { BlockDefinition } from "../definition"
import BlockField from "./BlockField"

import { Alert, AlertDescription } from "@/ui/alert"

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
    <div className="px-4 pb-4">
      {!validation.success && (
        <Alert variant="info" className="mt-3">
          <AlertDescription>
            This block contains values that do not match its definition.
          </AlertDescription>
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
    </div>
  )
}
