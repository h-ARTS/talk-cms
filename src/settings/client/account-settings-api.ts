import type {
  AccountSettingsInput,
  ThemeMode,
} from "../core/account-settings"

export type AccountSettingsResponse = {
  themeMode: ThemeMode
  visualComposerUrl: string | null
  updatedAt: string | null
}

export async function loadAccountSettings(): Promise<AccountSettingsResponse> {
  const response = await fetch("/api/internal/settings")
  return readSettingsResponse(response, "The settings could not be loaded.")
}

export async function saveAccountSettings(
  settings: AccountSettingsInput
): Promise<AccountSettingsResponse> {
  const response = await fetch("/api/internal/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })
  return readSettingsResponse(response, "The settings could not be saved.")
}

export async function saveAccountTheme(themeMode: ThemeMode): Promise<ThemeMode> {
  const response = await fetch("/api/internal/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ themeMode }),
  })
  const value = await readJson(response, "The theme setting could not be saved.")
  if (!response.ok) {
    throw new Error(readApiError(value, "The theme setting could not be saved."))
  }
  if (!isRecord(value) || (value.themeMode !== "light" && value.themeMode !== "dark")) {
    throw new Error("The theme response is invalid.")
  }
  return value.themeMode
}

async function readSettingsResponse(
  response: Response,
  fallback: string
): Promise<AccountSettingsResponse> {
  const value = await readJson(response, fallback)
  if (!response.ok) throw new Error(readApiError(value, fallback))
  if (!isAccountSettingsResponse(value)) {
    throw new Error("The settings response is invalid.")
  }
  return value
}

function isAccountSettingsResponse(value: unknown): value is AccountSettingsResponse {
  return (
    isRecord(value) &&
    (value.themeMode === "light" || value.themeMode === "dark") &&
    (value.visualComposerUrl === null || typeof value.visualComposerUrl === "string") &&
    (value.updatedAt === null ||
      (typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt))))
  )
}

async function readJson(response: Response, fallback: string): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new Error(fallback)
  }
}

function readApiError(value: unknown, fallback: string): string {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
