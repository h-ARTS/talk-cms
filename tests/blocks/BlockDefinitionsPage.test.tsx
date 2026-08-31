import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "react-redux"
import { RouterProvider, createMemoryHistory, createRouter } from "@tanstack/react-router"
import store from "@/store/index"
import { routeTree } from "../../src/routeTree.gen"
import { BlockRegistryProvider } from "@/blocks/client/BlockRegistryProvider"

const fetchMock = vi.fn<typeof fetch>()

describe("BlockDefinitionsPage", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    )
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => vi.unstubAllGlobals())

  test("starts empty and creates a marketer-defined block", async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/blocks"] }),
    })

    render(
      <Provider store={store}>
        <BlockRegistryProvider>
          <RouterProvider router={router} />
        </BlockRegistryProvider>
      </Provider>
    )

    expect(await screen.findByTestId("empty-block-list")).toBeInTheDocument()
    fireEvent.click(screen.getByTestId("block-create-button"))
    fireEvent.change(screen.getByTestId("block-name"), {
      target: { value: "CampaignHero" },
    })
    fireEvent.change(screen.getByTestId("block-label"), {
      target: { value: "Campaign hero" },
    })
    fireEvent.change(screen.getByTestId("field-key-0"), {
      target: { value: "headline" },
    })
    fireEvent.change(screen.getByTestId("field-label-0"), {
      target: { value: "Headline" },
    })

    fetchMock
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            name: "CampaignHero",
            metadata: { label: "Campaign hero" },
            fields: [
              { key: "headline", type: "text", label: "Headline", default: "" },
            ],
            allowedChildren: false,
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              name: "CampaignHero",
              metadata: { label: "Campaign hero" },
              fields: [
                { key: "headline", type: "text", label: "Headline", default: "" },
              ],
              allowedChildren: false,
            },
          ]),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )

    fireEvent.click(screen.getByTestId("save-block-definition"))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/block-definitions",
        expect.objectContaining({ method: "POST" })
      )
    )
    expect(await screen.findByTestId("block-row-CampaignHero")).toBeVisible()
  })

  test("keeps focus while typing a content field key", async () => {
    const user = userEvent.setup()
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ["/blocks"] }),
    })

    render(
      <Provider store={store}>
        <BlockRegistryProvider>
          <RouterProvider router={router} />
        </BlockRegistryProvider>
      </Provider>
    )

    await screen.findByTestId("empty-block-list")
    await user.click(screen.getByTestId("block-create-button"))
    const fieldKeyInput = screen.getByTestId("field-key-0")

    await user.type(fieldKeyInput, "headline")

    expect(fieldKeyInput).toHaveValue("headline")
    expect(fieldKeyInput).toHaveFocus()
  })
})
