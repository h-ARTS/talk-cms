import { useThemeStore } from "@/store/themeStore"

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  useThemeStore.setState({
    mode: "dark",
    visualComposerUrl: null,
    settingsLoaded: false,
    themeSaving: false,
  })
})

describe("theme settings store", () => {
  test("blocks theme changes before account settings hydrate", () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    useThemeStore.getState().toggleThemeMode()

    expect(useThemeStore.getState().mode).toBe("dark")
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test("persists only theme mode and blocks overlapping toggles", async () => {
    let resolveRequest: ((response: Response) => void) | undefined
    const fetchMock = vi.fn().mockImplementation(
      () => new Promise<Response>((resolve) => {
        resolveRequest = resolve
      })
    )
    vi.stubGlobal("fetch", fetchMock)
    useThemeStore.setState({
      mode: "dark",
      visualComposerUrl: "https://preview.example.com",
      settingsLoaded: true,
      themeSaving: false,
    })

    useThemeStore.getState().toggleThemeMode()
    useThemeStore.getState().toggleThemeMode()

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith("/api/internal/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeMode: "light" }),
    })
    expect(useThemeStore.getState()).toMatchObject({
      mode: "light",
      visualComposerUrl: "https://preview.example.com",
      themeSaving: true,
    })

    resolveRequest?.(Response.json({ themeMode: "light" }))
    await vi.waitFor(() => expect(useThemeStore.getState().themeSaving).toBe(false))
    expect(useThemeStore.getState().visualComposerUrl).toBe(
      "https://preview.example.com"
    )
  })

  test("rolls back the active theme mutation when persistence fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({ error: "database unavailable" }, { status: 500 })
      )
    )
    useThemeStore.setState({
      mode: "dark",
      visualComposerUrl: "https://preview.example.com",
      settingsLoaded: true,
      themeSaving: false,
    })

    useThemeStore.getState().toggleThemeMode()

    await vi.waitFor(() => expect(useThemeStore.getState().themeSaving).toBe(false))
    expect(useThemeStore.getState()).toMatchObject({
      mode: "dark",
      visualComposerUrl: "https://preview.example.com",
    })
  })
})
