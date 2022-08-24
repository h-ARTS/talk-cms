// components/Layout.tsx
import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/src/store"
import { getTheme } from "@/src/theme"
import { CssBaseline, Box } from "@mui/material"
import { ThemeProvider as MuiThemeProvider } from "@mui/system"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode)
  const theme = getTheme(themeMode)

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </MuiThemeProvider>
  )
}

export default Layout
