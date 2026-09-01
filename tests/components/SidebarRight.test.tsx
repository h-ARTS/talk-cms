import React from "react"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { usePageBuilderStore } from "@/store/index"
import SidebarRight from "@/components/SidebarRight"
import { BlockRegistryProvider } from "@/blocks/client/BlockRegistryProvider"

describe("SidebarRight", () => {
  beforeEach(() => {
    usePageBuilderStore.setState({
      blocks: [],
      activeBlock: null,
      navigationHistory: [],
      pageName: "",
    })
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

  test("renders tabs and switches between them", async () => {
    const user = userEvent.setup()
    const { getByRole, getByTestId } = renderSidebarRight()

    const blocksTab = getByRole("tab", { name: "Blocks" })
    const configTab = getByRole("tab", { name: "Config" })
    expect(blocksTab).toHaveAttribute("data-state", "active")
    expect(configTab).toHaveAttribute("data-state", "inactive")

    await user.click(configTab)
    expect(configTab).toHaveAttribute("data-state", "active")
    expect(blocksTab).toHaveAttribute("data-state", "inactive")
    await user.type(getByTestId("page-name-input"), "home")
    expect(usePageBuilderStore.getState().pageName).toBe("home")
  })
})
