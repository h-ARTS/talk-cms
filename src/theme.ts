// src/theme.ts
import { createTheme, ThemeOptions } from "@mui/material"

const lightTheme: ThemeOptions = {
  palette: {
    mode: "light",
  },
}

const darkTheme: ThemeOptions = {
  palette: {
    mode: "dark",
  },
}

export const getTheme = (mode: "light" | "dark") =>
  createTheme(mode === "light" ? lightTheme : darkTheme)
