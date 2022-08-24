// src/store/themeSlice.ts
import { createSlice } from "@reduxjs/toolkit"

interface ThemeState {
  mode: "light" | "dark"
}

const initialState: ThemeState = {
  mode: "light",
}

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleThemeMode(state) {
      state.mode = state.mode === "light" ? "dark" : "light"
    },
  },
})

export const { toggleThemeMode } = themeSlice.actions
export default themeSlice.reducer
