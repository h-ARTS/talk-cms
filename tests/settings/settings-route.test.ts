import type {
  AccountSettings,
  AccountSettingsInput,
  AccountSettingsRepository,
} from "@/settings/core/account-settings"
import {
  createSettingsGetHandler,
  createSettingsPatchHandler,
  createSettingsPutHandler,
} from "../../src/routes/api/internal/settings"

const storedSettings: AccountSettings = {
  themeMode: "light",
  visualComposerUrl: "https://preview.example.com?editMode=true",
  updatedAt: new Date("2026-09-01T10:00:00.000Z"),
}

class RecordingSettingsRepository implements AccountSettingsRepository {
  updated?: { email: string; settings: AccountSettingsInput }
  updatedTheme?: { email: string; themeMode: "light" | "dark" }

  constructor(private readonly result: AccountSettings | null = storedSettings) {}

  async findByEmail(): Promise<AccountSettings | null> {
    return this.result
  }

  async updateByEmail(
    email: string,
    settings: AccountSettingsInput
  ): Promise<AccountSettings | null> {
    this.updated = { email, settings }
    return this.result
  }

  async updateThemeByEmail(
    email: string,
    themeMode: "light" | "dark"
  ): Promise<"light" | "dark" | null> {
    this.updatedTheme = { email, themeMode }
    return this.result ? themeMode : null
  }
}

function createRequest(body: unknown): Request {
  return new Request("http://localhost/api/internal/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("settings GET handler", () => {
  test("returns only the configured account settings", async () => {
    const response = await createSettingsGetHandler({
      accountEmail: "owner@example.com",
      repository: new RecordingSettingsRepository(),
    })()

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({
      themeMode: "light",
      visualComposerUrl: "https://preview.example.com?editMode=true",
      updatedAt: "2026-09-01T10:00:00.000Z",
    })
  })

  test("reports a missing configured account", async () => {
    const response = await createSettingsGetHandler({
      accountEmail: "missing@example.com",
      repository: new RecordingSettingsRepository(null),
    })()

    expect(response.status).toBe(404)
  })
})

describe("settings PUT handler", () => {
  test("validates and persists settings for the configured account", async () => {
    const repository = new RecordingSettingsRepository()
    const response = await createSettingsPutHandler({
      accountEmail: "owner@example.com",
      repository,
    })(
      createRequest({
        themeMode: "dark",
        visualComposerUrl: " https://site.example.com/editor ",
      })
    )

    expect(response.status).toBe(200)
    expect(repository.updated).toEqual({
      email: "owner@example.com",
      settings: {
        themeMode: "dark",
        visualComposerUrl: "https://site.example.com/editor",
      },
    })
  })

  test.each(["javascript:alert(1)", "preview.example.com", "ftp://preview.example.com"])(
    "rejects unsupported visual composer URL %s",
    async (visualComposerUrl) => {
      const repository = new RecordingSettingsRepository()
      const response = await createSettingsPutHandler({
        accountEmail: "owner@example.com",
        repository,
      })(createRequest({ themeMode: "dark", visualComposerUrl }))

      expect(response.status).toBe(400)
      expect(repository.updated).toBeUndefined()
    }
  )
})

describe("settings PATCH handler", () => {
  test("persists only the configured account theme", async () => {
    const repository = new RecordingSettingsRepository()
    const response = await createSettingsPatchHandler({
      accountEmail: "owner@example.com",
      repository,
    })(createRequest({ themeMode: "light" }))

    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ themeMode: "light" })
    expect(repository.updatedTheme).toEqual({
      email: "owner@example.com",
      themeMode: "light",
    })
    expect(repository.updated).toBeUndefined()
  })
})
