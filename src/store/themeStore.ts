import { create } from "zustand"

interface ThemeState {
  mode: "light" | "dark"
  toggleThemeMode: () => void
}

export const useThemeStore = create<ThemeState>()((set) => ({
  mode: "dark",
  toggleThemeMode: () =>
    set((state) => ({ mode: state.mode === "light" ? "dark" : "light" })),
}))
