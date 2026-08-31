import type { z } from "zod"

export type BlockInput =
  | {
      type: "text" | "textarea" | "url" | "color"
      label: string
      description?: string
      placeholder?: string
    }
  | {
      type: "number"
      label: string
      description?: string
      min?: number
      max?: number
      step?: number
      suffix?: string
    }
  | {
      type: "boolean"
      label: string
      description?: string
    }

export type BlockMetadata = {
  label: string
  description?: string
  icon?: string
  category?: string
}

export type ChildPolicy = boolean | readonly string[]

export type BlockDefinition = {
  name: string
  metadata: BlockMetadata
  schema: z.ZodObject
  inputs: Record<string, BlockInput>
  allowedChildren: ChildPolicy
}

export function createDefaultContent(
  definition: BlockDefinition
): Record<string, unknown> {
  const result = definition.schema.safeParse({})
  if (!result.success) {
    throw new Error(`Block ${definition.name} has invalid field defaults`)
  }
  return result.data
}
