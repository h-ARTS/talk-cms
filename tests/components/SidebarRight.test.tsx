import React from "react"
import { render, fireEvent } from "@testing-library/react"
import SidebarRight from "@/components/SidebarRight"
import { BlockRegistryProvider } from "@/blocks/client/BlockRegistryProvider"
import { usePageBuilderStore } from "@/store/index"

describe("SidebarRight", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        )
      )
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  const renderSidebarRight = () =>
    render(
      <BlockRegistryProvider>
        <SidebarRight />
      </BlockRegistryProvider>
    )

  test("renders tabs and switches between them", () => {
    const { getByText, queryByTestId } = renderSidebarRight()

    // Check initial tab state
    expect(getByText("Blocks")).toBeInTheDocument()
    expect(getByText("Config")).toBeInTheDocument()
    expect(queryByTestId("page-alias-input")).not.toBeInTheDocument()

    // Switch to Config tab
    fireEvent.click(getByText("Config"))
    expect(queryByTestId("page-alias-input")).toBeInTheDocument()
  })

  test("edits the page alias in the config tab", () => {
    const { getByText, getByTestId } = renderSidebarRight()

    fireEvent.click(getByText("Config"))
    const aliasInput = getByTestId("page-alias-input")
    fireEvent.change(aliasInput, { target: { value: "home" } })

    expect(usePageBuilderStore.getState().pageAlias).toBe("home")
  })
})
