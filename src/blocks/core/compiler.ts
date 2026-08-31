import { z } from "zod"
import type { BlockDefinition, BlockInput } from "./definition"
import type { BlockDescriptor, FieldDescriptor } from "./descriptor"

export function compileBlockDefinition(
  descriptor: BlockDescriptor
): BlockDefinition {
  const shape: Record<string, z.ZodType> = {}
  const inputs: Record<string, BlockInput> = {}

  for (const field of descriptor.fields) {
    shape[field.key] = compileFieldSchema(field)
    inputs[field.key] = createInput(field)
  }

  return {
    name: descriptor.name,
    metadata: descriptor.metadata,
    schema: z.strictObject(shape),
    inputs,
    allowedChildren: descriptor.allowedChildren,
  }
}

function compileFieldSchema(field: FieldDescriptor): z.ZodType {
  if (field.type === "boolean") return z.boolean().prefault(field.default)

  if (field.type === "number") {
    let schema = z.number().finite()
    if (field.min !== undefined) schema = schema.min(field.min)
    if (field.max !== undefined) schema = schema.max(field.max)
    return schema.prefault(field.default)
  }

  if (field.type === "url") {
    return z.union([z.url(), z.literal("")]).prefault(field.default)
  }

  return z.string().prefault(field.default)
}

function createInput(field: FieldDescriptor): BlockInput {
  const common = {
    type: field.type,
    label: field.label,
    description: field.description,
  }

  if (field.type === "boolean") return common
  if (field.type === "number") {
    return {
      ...common,
      min: field.min,
      max: field.max,
      step: field.step,
      suffix: field.suffix,
    }
  }
  return { ...common, placeholder: field.placeholder }
}
