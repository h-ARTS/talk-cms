import React from "react"
import { render, fireEvent } from "@testing-library/react"
import { Provider } from "react-redux"
import store from "@/store/index"
import SidebarRight from "@/components/SidebarRight"

describe("SidebarRight", () => {
  const renderSidebarRight = () =>
    render(
      <Provider store={store}>
        <SidebarRight />
      </Provider>
    )

  test("renders tabs and switches between them", () => {
    const { getByText, queryByText } = renderSidebarRight()

    // Check initial tab state
    expect(getByText("Blocks")).toBeInTheDocument()
    expect(getByText("Config")).toBeInTheDocument()
    expect(queryByText("Config content goes here.")).not.toBeInTheDocument()

    // Switch to Config tab
    fireEvent.click(getByText("Config"))
    expect(queryByText("Config content goes here.")).toBeInTheDocument()
  })
})
