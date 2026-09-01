import { useState, type ReactNode } from "react"
import {
  LayoutDashboardIcon,
  FileTextIcon,
  BlocksIcon,
  MenuIcon,
  XIcon,
} from "lucide-react"
import { useRouterState } from "@tanstack/react-router"

import DashboardNavigationLink from "@/components/DashboardNavigationLink"
const navigation = [
  { label: "Dashboard", to: "/", icon: LayoutDashboardIcon },
  { label: "Pages", to: "/content/pages", icon: FileTextIcon },
  { label: "Block definitions", to: "/blocks", icon: BlocksIcon },
] as const

function NavigationContent({
  onNavigate,
  showBrand = true,
}: {
  onNavigate?: () => void
  showBrand?: boolean
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <div className="flex h-full flex-col">
      {showBrand && (
        <div className="border-b border-border px-6 py-5">
          <p className="font-display text-lg font-bold tracking-tight">Talk CMS</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Content workspace</p>
        </div>
      )}
      <nav aria-label="Main navigation" className="flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <DashboardNavigationLink
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              active={pathname === item.to}
              onClick={onNavigate}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </DashboardNavigationLink>
          )
        })}
      </nav>
    </div>
  )
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
          className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          <MenuIcon className="size-5" />
        </button>
        <p className="font-display text-base font-bold tracking-tight">Talk CMS</p>
      </header>

      {mobileOpen && (        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-5">
              <p className="font-display text-lg font-bold tracking-tight">Talk CMS</p>
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setMobileOpen(false)}
                className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <NavigationContent onNavigate={() => setMobileOpen(false)} showBrand={false} />
          </div>
        </div>
      )}

      <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:block">
        <div className="sticky top-0 h-screen">
          <NavigationContent />
        </div>
      </aside>

      <main className="min-w-0 flex-1 pt-16 md:pt-0">{children}</main>
    </div>
  )
}
