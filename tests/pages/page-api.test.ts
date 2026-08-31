import {
  deletePage,
  listPages,
  loadPage,
  savePage,
  updatePage,
} from "@/pages/client/page-api"

const validPage = {
  id: "page-1",
  blocks: [
    { id: "hero-1", type: "Hero", parentId: null, content: { title: "Hello" } },
  ],
  createdAt: "2026-08-31T10:00:00.000Z",
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("page API", () => {
  test("loads a valid saved page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(validPage)))

    await expect(loadPage("page-1")).resolves.toEqual(validPage)
  })

  test("rejects malformed blocks", async () => {
    const malformedPage = { ...validPage, blocks: [{ id: "hero-1" }] }
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(malformedPage)))

    await expect(loadPage("page-1")).rejects.toThrow("The page response is invalid.")
  })

  test("rejects invalid timestamps", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json([{ ...validPage, createdAt: "invalid" }]))
    )

    await expect(listPages()).rejects.toThrow("The pages response is invalid.")
  })

  test("uses a stable message for non-JSON errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 }))
    )

    await expect(listPages()).rejects.toThrow("The pages could not be loaded.")
  })

  test("returns the newly created page", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(validPage, { status: 201 })))

    await expect(savePage(validPage.blocks)).resolves.toEqual(validPage)
  })

  test("updates the selected page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)

    await updatePage("page-1", validPage.blocks)

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal/pages?id=page-1",
      expect.objectContaining({ method: "PUT" })
    )
  })

  test("deletes the selected page", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }))
    vi.stubGlobal("fetch", fetchMock)

    await deletePage("page-1")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/internal/pages?id=page-1",
      { method: "DELETE" }
    )
  })
})
