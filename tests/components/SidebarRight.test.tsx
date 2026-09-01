import React from "react"
import { render } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import store from "@/store/index"
import SidebarRight from "@/components/SidebarRight"
import { BlockRegistryProvider } from "@/blocks/client/BlockRegistryProvider"

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
      <Provider store={store}>
        <BlockRegistryProvider>
          <SidebarRight />
        </BlockRegistryProvider>
      </Provider>
    )

  test("renders tabs and switches between them", async () => {
    const user = userEvent.setup()
    const { getByRole, findByText } = renderSidebarRight()

    const blocksTab = getByRole("tab", { name: "Blocks" })
    const configTab = getByRole("tab", { name: "Config" })
    expect(blocksTab).toHaveAttribute("data-state", "active")
    expect(configTab).toHaveAttribute("data-state", "inactive")

    // Switch to Config tab
    await user.click(configTab)
    expect(configTab).toHaveAttribute("data-state", "active")
    expect(blocksTab).toHaveAttribute("data-state", "inactive")
    expect(await findByText("Config content goes here.")).toBeInTheDocument()
  })
})
