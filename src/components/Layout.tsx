// components/Layout.tsx
import React, { useEffect } from "react"
import { useSelector } from "react-redux"
import { RootState } from "@/store/index"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const themeMode = useSelector((state: RootState) => state.theme.mode)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", themeMode === "dark")
    root.style.colorScheme = themeMode
  }, [themeMode])

  return <div className="flex min-h-screen flex-col">{children}</div>
}

export default Layout
