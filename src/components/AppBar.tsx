import React, { useState } from "react"
import { Link } from "@tanstack/react-router"
import { MenuIcon, BlocksIcon, MoonIcon, SunIcon, XIcon } from "lucide-react"
import BlockTreeView from "./BlockTreeView"
import { usePageBuilderStore, useThemeStore } from "@/store/index"
import { Block } from "@/types/index"
import { savePage, updatePage, type SavedPage } from "@/pages/client/page-api"

import { Button } from "@/ui/button"
import { Switch } from "@/ui/switch"
import { Label } from "@/ui/label"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip"
import { Avatar, AvatarFallback } from "@/ui/avatar"
import { Toaster, type ToastItem } from "@/ui/toast"

type TopAppBarProps = {
  pageId?: string
  onPageCreated?: (page: SavedPage) => Promise<void>
}

const TopAppBar: React.FC<TopAppBarProps> = ({ pageId, onPageCreated }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const blocks = usePageBuilderStore((state) => state.blocks)
  const pageName = usePageBuilderStore((state) => state.pageName)
  const setActiveBlock = usePageBuilderStore((state) => state.setActiveBlock)
  const setNavigationHistory = usePageBuilderStore(
    (state) => state.setNavigationHistory
  )
  const mode = useThemeStore((state) => state.mode)
  const settingsLoaded = useThemeStore((state) => state.settingsLoaded)
  const themeSaving = useThemeStore((state) => state.themeSaving)
  const toggleThemeMode = useThemeStore((state) => state.toggleThemeMode)

  const pushToast = (variant: ToastItem["variant"], title: string) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, variant, title }])
  }

  const handleSetActiveBlock = (block: Block) => {
    setActiveBlock(block)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const normalizedPageName = pageName.trim() || null
      if (pageId) await updatePage(pageId, blocks, normalizedPageName)
      else if (onPageCreated) {
        await onPageCreated(await savePage(blocks, normalizedPageName))
      } else await savePage(blocks, normalizedPageName)
      pushToast("success", "Page saved.")
    } catch (error) {
      console.error("Failed to save page:", error)
      pushToast(
        "destructive",
        error instanceof Error
          ? error.message
          : pageId
            ? "The page could not be updated."
            : "The page could not be saved."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Block hierarchy"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Block hierarchy</TooltipContent>
        </Tooltip>

        <p className="min-w-0 flex-1 truncate font-display text-sm font-semibold tracking-tight text-muted-foreground">
          /home
        </p>

        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="hidden sm:flex">
              <AvatarFallback>TC</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>Username</TooltipContent>
        </Tooltip>

        <div className="ml-2 flex items-center gap-2">
          <Switch
            id="dark-mode-toggle"
            checked={mode === "dark"}
            onCheckedChange={toggleThemeMode}
            disabled={!settingsLoaded || themeSaving}
            aria-label="Toggle dark mode"
          />
          <Label htmlFor="dark-mode-toggle" className="hidden cursor-pointer items-center gap-1 text-xs text-muted-foreground lg:flex">
            {mode === "dark" ? <MoonIcon className="size-3.5" /> : <SunIcon className="size-3.5" />}
            Dark
          </Label>
        </div>

        <div className="mx-1 flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/blocks">
              <BlocksIcon />
              <span className="hidden md:inline">Block definitions</span>
              <span className="sr-only md:hidden">Block definitions</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button size="sm">Publish</Button>
        </div>
      </header>

      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            aria-hidden
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-display text-sm font-semibold">Blocks</p>
              <Button variant="ghost" size="icon" aria-label="Close" onClick={() => setDrawerOpen(false)}>
                <XIcon />
              </Button>
            </div>
            <BlockTreeView
              onBlockItemClick={handleSetActiveBlock}
              onNavigationHistoryChange={(history) => {
                setNavigationHistory(history)
                setDrawerOpen(false)
              }}
            />
          </div>
        </div>
      )}

      <Toaster toasts={toasts} onDismiss={(id) => setToasts((c) => c.filter((t) => t.id !== id))} />
    </>
  )
}

export default TopAppBar
