import { compileBlockDefinition } from "@/blocks/core/compiler"
import {
  parseBlockDescriptor,
  validateBlockDescriptors,
} from "@/blocks/core/descriptor"
import { createDefaultContent } from "@/blocks/core/definition"
import { createBlockRegistry } from "@/blocks/core/registry"

const quoteDescriptor = {
  name: "Quote",
  metadata: { label: "Quote", description: "A quotation." },
  fields: [
    {
      key: "quote",
      type: "textarea",
      label: "Quote",
      default: "",
    },
    {
      key: "featured",
      type: "boolean",
      label: "Featured",
      default: false,
    },
  ],
  allowedChildren: false,
}

describe("managed block definitions", () => {
  test("compiles serializable fields into a strict Zod definition", () => {
    const parsed = parseBlockDescriptor(quoteDescriptor)
    expect(parsed.success).toBe(true)
    if (!parsed.success) return

    const definition = compileBlockDefinition(parsed.data)
    expect(createDefaultContent(definition)).toEqual({ quote: "", featured: false })
    expect(definition.schema.safeParse({ quote: "Hello", featured: true }).success).toBe(true)
    expect(
      definition.schema.safeParse({ quote: "Hello", featured: true, unknown: 1 }).success
    ).toBe(false)
  })

  test("rejects duplicate block names and field keys case-insensitively", () => {
    expect(
      validateBlockDescriptors([quoteDescriptor, { ...quoteDescriptor, name: "quote" }])
    ).toEqual({ success: false, message: "Duplicate block name: quote" })

    expect(
      parseBlockDescriptor({
        ...quoteDescriptor,
        fields: [
          quoteDescriptor.fields[0],
          { ...quoteDescriptor.fields[0], key: "QUOTE" },
        ],
      })
    ).toEqual({ success: false, message: "Duplicate field key: QUOTE" })
  })

  test("rejects invalid URL and constrained number defaults", () => {
    expect(
      parseBlockDescriptor({
        ...quoteDescriptor,
        fields: [
          { key: "link", type: "url", label: "Link", default: "not-a-url" },
        ],
      }).success
    ).toBe(false)

    expect(
      parseBlockDescriptor({
        ...quoteDescriptor,
        fields: [
          {
            key: "columns",
            type: "number",
            label: "Columns",
            default: 13,
            max: 12,
          },
        ],
      })
    ).toEqual({ success: false, message: "Default exceeds the maximum" })
  })

  test("rejects unknown explicit child references", () => {
    expect(
      validateBlockDescriptors([
        { ...quoteDescriptor, allowedChildren: ["DoesNotExist"] },
      ])
    ).toEqual({
      success: false,
      message: "Block Quote references unknown child block: DoesNotExist",
    })
  })

  test("creates runtime blocks and enforces child policy", () => {
    const parsed = validateBlockDescriptors([
      quoteDescriptor,
      {
        name: "QuoteList",
        metadata: { label: "Quote list" },
        fields: [],
        allowedChildren: ["Quote"],
      },
    ])
    expect(parsed.success).toBe(true)
    if (!parsed.success) return

    const registry = createBlockRegistry(parsed.data.map(compileBlockDefinition))
    expect(registry.createBlock("quote", null, "1")).toEqual({
      id: "1",
      type: "Quote",
      parentId: null,
      content: { quote: "", featured: false },
    })
    expect(registry.allowsChild("QuoteList", "Quote")).toBe(true)
    expect(registry.allowsChild("Quote", "QuoteList")).toBe(false)
  })
})
