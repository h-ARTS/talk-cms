import { z } from "zod"
import type { ValidationResult } from "./validation-result"

const identifier = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z][A-Za-z0-9_-]*$/, "Use letters, numbers, underscores, or hyphens")
  .refine(
    (value) => !["__proto__", "prototype", "constructor"].includes(value),
    "This name is reserved"
  )

const fieldMetadata = {
  key: identifier,
  label: z.string().trim().min(1).max(100),
  description: z.string().trim().max(300).optional(),
}

const basicTextFieldSchema = z.strictObject({
  ...fieldMetadata,
  type: z.enum(["text", "textarea", "color"]),
  default: z.string().max(10_000),
  placeholder: z.string().max(200).optional(),
})

const urlFieldSchema = z.strictObject({
  ...fieldMetadata,
  type: z.literal("url"),
  default: z.union([z.url(), z.literal("")]),
  placeholder: z.string().max(200).optional(),
})

const numberFieldSchema = z
  .strictObject({
    ...fieldMetadata,
    type: z.literal("number"),
    default: z.number().finite(),
    min: z.number().finite().optional(),
    max: z.number().finite().optional(),
    step: z.number().finite().positive().optional(),
    suffix: z.string().max(20).optional(),
  })
  .refine(
    ({ min, max }) => min === undefined || max === undefined || min <= max,
    { message: "Minimum cannot exceed maximum", path: ["min"] }
  )
  .refine(
    ({ default: value, min }) => min === undefined || value >= min,
    { message: "Default is below the minimum", path: ["default"] }
  )
  .refine(
    ({ default: value, max }) => max === undefined || value <= max,
    { message: "Default exceeds the maximum", path: ["default"] }
  )

const booleanFieldSchema = z.strictObject({
  ...fieldMetadata,
  type: z.literal("boolean"),
  default: z.boolean(),
})

export const fieldDescriptorSchema = z.discriminatedUnion("type", [
  basicTextFieldSchema,
  urlFieldSchema,
  numberFieldSchema,
  booleanFieldSchema,
])

export const blockDescriptorSchema = z.strictObject({
  name: identifier,
  metadata: z.strictObject({
    label: z.string().trim().min(1).max(100),
    description: z.string().trim().max(500).optional(),
    icon: z.string().trim().max(50).optional(),
    category: z.string().trim().max(50).optional(),
  }),
  fields: z.array(fieldDescriptorSchema).max(50),
  allowedChildren: z.union([z.boolean(), z.array(identifier).max(50)]),
})

export type FieldDescriptor = z.output<typeof fieldDescriptorSchema>
export type BlockDescriptor = z.output<typeof blockDescriptorSchema>

export function parseBlockDescriptor(value: unknown): ValidationResult<BlockDescriptor> {
  const parsed = blockDescriptorSchema.safeParse(value)
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? "Invalid block definition",
    }
  }

  const fieldKeys = new Set<string>()
  for (const field of parsed.data.fields) {
    const normalizedKey = field.key.toLowerCase()
    if (fieldKeys.has(normalizedKey)) {
      return { success: false, message: `Duplicate field key: ${field.key}` }
    }
    fieldKeys.add(normalizedKey)
  }

  return { success: true, data: parsed.data }
}

export function validateBlockDescriptors(
  values: readonly unknown[]
): ValidationResult<BlockDescriptor[]> {
  const descriptors: BlockDescriptor[] = []
  const names = new Set<string>()

  for (const value of values) {
    const parsed = parseBlockDescriptor(value)
    if (!parsed.success) return parsed

    const normalizedName = parsed.data.name.toLowerCase()
    if (names.has(normalizedName)) {
      return { success: false, message: `Duplicate block name: ${parsed.data.name}` }
    }
    names.add(normalizedName)
    descriptors.push(parsed.data)
  }

  for (const descriptor of descriptors) {
    if (!Array.isArray(descriptor.allowedChildren)) continue
    for (const childName of descriptor.allowedChildren) {
      if (!names.has(childName.toLowerCase())) {
        return {
          success: false,
          message: `Block ${descriptor.name} references unknown child block: ${childName}`,
        }
      }
    }
  }

  return { success: true, data: descriptors }
}
