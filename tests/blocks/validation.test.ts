import { createBlockCatalog } from "@/blocks/core/ai"
import { compileBlockDefinition } from "@/blocks/core/compiler"
import { validateBlockDescriptors } from "@/blocks/core/descriptor"
import { createBlockRegistry } from "@/blocks/core/registry"
import {
  validateGeneratedBlocks,
  validateStoredBlocks,
} from "@/blocks/core/validation"

const parsed = validateBlockDescriptors([
  {
    name: "Hero",
    metadata: { label: "Hero", description: "Campaign hero" },
    fields: [{ key: "title", type: "text", label: "Title", default: "" }],
    allowedChildren: true,
  },
  {
    name: "Card",
    metadata: { label: "Card" },
    fields: [{ key: "count", type: "number", label: "Count", default: 0, max: 12 }],
    allowedChildren: false,
  },
])
if (!parsed.success) throw new Error(parsed.message)
const registry = createBlockRegistry(parsed.data.map(compileBlockDefinition))

describe("dynamic block validation", () => {
  test("builds the AI catalog from the runtime registry", () => {
    const catalog = createBlockCatalog(registry)
    expect(catalog).toContain("Hero")
    expect(catalog).toContain("count (number, maximum 12)")
  })

  test("canonicalizes names and applies defaults recursively", () => {
    expect(
      validateGeneratedBlocks(
        [{ type: "hero", content: {}, children: [{ type: "card", content: {} }] }],
        registry
      )
    ).toEqual({
      success: true,
      data: [
        {
          type: "Hero",
          content: { title: "" },
          children: [{ type: "Card", content: { count: 0 }, children: [] }],
        },
      ],
    })
  })

  test("rejects unknown blocks, invalid content, and graph cycles", () => {
    expect(
      validateGeneratedBlocks([{ type: "Unknown", content: {} }], registry)
    ).toEqual({ success: false, message: "No Unknown block found in the project." })

    expect(
      validateGeneratedBlocks([{ type: "Card", content: { count: 13 } }], registry)
        .success
    ).toBe(false)

    expect(
      validateStoredBlocks(
        [
          { id: "one", type: "Hero", parentId: "two", content: {} },
          { id: "two", type: "Hero", parentId: "one", content: {} },
        ],
        registry
      )
    ).toEqual({ success: false, message: "Block response contains a cycle." })
  })
})
