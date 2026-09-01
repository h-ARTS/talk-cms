import {
  loadAccountSettings,
  saveAccountSettings,
  saveAccountTheme,
} from "@/settings/client/account-settings-api"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("account settings client API", () => {
  test("loads validated account settings", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          themeMode: "dark",
          visualComposerUrl: null,
          updatedAt: null,
        })
      )
    )

    await expect(loadAccountSettings()).resolves.toEqual({
      themeMode: "dark",
      visualComposerUrl: null,
      updatedAt: null,
    })
  })

  test("sends the complete settings update", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        themeMode: "light",
        visualComposerUrl: "https://preview.example.com",
        updatedAt: "2026-09-01T10:00:00.000Z",
      })
    )
    vi.stubGlobal("fetch", fetchMock)

    await saveAccountSettings({
      themeMode: "light",
      visualComposerUrl: "https://preview.example.com",
    })

    expect(fetchMock).toHaveBeenCalledWith("/api/internal/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        themeMode: "light",
        visualComposerUrl: "https://preview.example.com",
      }),
    })
  })

  test("rejects invalid successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ themeMode: "sepia" }))
    )

    await expect(loadAccountSettings()).rejects.toThrow(
      "The settings response is invalid."
    )
  })

  test("saves theme mode without sending other settings", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ themeMode: "light" }))
    vi.stubGlobal("fetch", fetchMock)

    await expect(saveAccountTheme("light")).resolves.toBe("light")
    expect(fetchMock).toHaveBeenCalledWith("/api/internal/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeMode: "light" }),
    })
  })
})
