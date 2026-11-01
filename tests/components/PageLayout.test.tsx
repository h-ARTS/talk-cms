import { render, screen } from "@testing-library/react"

import PageLayout from "@/components/PageLayout"

describe("PageLayout", () => {
  test("uses the block definitions width and responsive spacing", () => {
    const { container } = render(<PageLayout>Page content</PageLayout>)

    expect(container.firstElementChild).toHaveClass(
      "mx-auto",
      "max-w-7xl",
      "px-6",
      "py-10",
      "md:py-14"
    )
    expect(screen.getByText("Page content")).toBeInTheDocument()
  })

  test("leaves page headers and landmarks to its children and shell", () => {
    const { container } = render(
      <PageLayout>
        <header><h1>Page title</h1></header>
        <form aria-label="Page form"><input aria-label="Page field" /></form>
      </PageLayout>
    )

    expect(container.firstElementChild?.tagName).toBe("DIV")
    expect(container.querySelectorAll("header")).toHaveLength(1)
    expect(container.querySelectorAll("main, nav, aside")).toHaveLength(0)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Page title")
    expect(screen.getByRole("form", { name: "Page form" }).previousElementSibling)
      .toBe(screen.getByRole("heading", { level: 1 }).parentElement)
  })
})
