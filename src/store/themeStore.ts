import { create } from "zustand"
import {
  loadAccountSettings,
  saveAccountSettings,
  saveAccountTheme,
  type AccountSettingsResponse,
} from "@/settings/client/account-settings-api"
import type { ThemeMode } from "@/settings/core/account-settings"

interface ThemeState {
  mode: ThemeMode
  visualComposerUrl: string | null
  settingsLoaded: boolean
  themeSaving: boolean
  applySettings: (settings: AccountSettingsResponse) => void
  loadSettings: () => Promise<void>
  saveSettings: (mode: ThemeMode, visualComposerUrl: string) => Promise<void>
  toggleThemeMode: () => void
}

let settingsRequest: Promise<void> | undefined

export const useThemeStore = create<ThemeState>()((set, get) => ({
  mode: "dark",
  visualComposerUrl: null,
  settingsLoaded: false,
  themeSaving: false,
  applySettings: (settings) => {
    set({
      mode: settings.themeMode,
      visualComposerUrl: settings.visualComposerUrl,
      settingsLoaded: true,
    })
  },
  loadSettings: async () => {
    settingsRequest ??= loadAccountSettings()
      .then((settings) => get().applySettings(settings))
      .catch((error: unknown) => {
        settingsRequest = undefined
        throw error
      })
    await settingsRequest
  },
  saveSettings: async (mode, visualComposerUrl) => {
    const settings = await saveAccountSettings({
      themeMode: mode,
      visualComposerUrl,
    })
    get().applySettings(settings)
  },
  toggleThemeMode: () => {
    if (!get().settingsLoaded || get().themeSaving) return
    const previousMode = get().mode
    const mode = previousMode === "light" ? "dark" : "light"
    set({ mode, themeSaving: true })
    void saveAccountTheme(mode)
      .then((persistedMode) => {
        set({ mode: persistedMode, themeSaving: false })
      })
      .catch((error: unknown) => {
        console.error("Failed to persist theme setting:", error)
        set({ mode: previousMode, themeSaving: false })
      })
  },
}))
