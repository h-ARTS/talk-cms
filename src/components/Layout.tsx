// components/Layout.tsx
import React, { useEffect } from "react"
import { useThemeStore } from "@/store/index"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const themeMode = useThemeStore((state) => state.mode)
  const loadSettings = useThemeStore((state) => state.loadSettings)

  useEffect(() => {
    void loadSettings().catch((error: unknown) => {
      console.error("Failed to hydrate account settings:", error)
    })
  }, [loadSettings])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", themeMode === "dark")
    root.style.colorScheme = themeMode
  }, [themeMode])

  return <div className="flex min-h-screen flex-col">{children}</div>
}

export default Layout
