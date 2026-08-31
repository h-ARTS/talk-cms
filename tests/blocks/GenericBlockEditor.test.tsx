import { fireEvent, render, screen } from "@testing-library/react"
import GenericBlockEditor from "@/blocks/core/editor/GenericBlockEditor"
import { compileBlockDefinition } from "@/blocks/core/compiler"
import { parseBlockDescriptor } from "@/blocks/core/descriptor"

const parsed = parseBlockDescriptor({
  name: "Campaign",
  metadata: { label: "Campaign" },
  fields: [
    { key: "columns", type: "number", label: "Columns", default: 1 },
    { key: "featured", type: "boolean", label: "Featured", default: false },
  ],
  allowedChildren: false,
})

if (!parsed.success) throw new Error(parsed.message)
const definition = compileBlockDefinition(parsed.data)

describe("GenericBlockEditor", () => {
  test("renders generated controls and emits typed values", () => {
    const onChange = vi.fn()
    render(
      <GenericBlockEditor
        definition={definition}
        content={{ columns: 1, featured: false }}
        onChange={onChange}
      />
    )

    fireEvent.change(screen.getByLabelText("Columns"), {
      target: { value: "6" },
    })
    expect(onChange).toHaveBeenCalledWith({ columns: 6, featured: false })

    fireEvent.click(screen.getByLabelText("Featured"))
    expect(onChange).toHaveBeenCalledWith({ columns: 1, featured: true })
  })
})
