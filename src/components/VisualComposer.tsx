import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels"
import ChatBox from "@/components/ChatBox"
import TopAppBar from "@/components/AppBar"
import RightSidebar from "@/components/SidebarRight"
import UrlAppBar from "@/components/UrlAppBar"
import useTransformedBlocks from "@/hooks/useTransformedBlocks"
import { loadPage } from "@/pages/client/page-api"
import { usePageBuilderStore } from "@/store/index"

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { Button } from "@/ui/button"
import { Spinner } from "@/ui/spinner"

const visualComposerUrlValue = import.meta.env.VITE_VISUAL_COMPOSER_URL?.trim()
const visualComposerUrl =
  visualComposerUrlValue && URL.canParse(visualComposerUrlValue)
    ? new URL(visualComposerUrlValue)
    : null
const isSupportedPreviewUrl =
  visualComposerUrl?.protocol === "http:" || visualComposerUrl?.protocol === "https:"

export default function VisualComposer({ pageId }: { pageId?: string }) {
  const navigate = useNavigate()
  const loadSavedPage = usePageBuilderStore((state) => state.loadSavedPage)
  const [isDragging, setIsDragging] = useState(false)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const aiSidebarRef = usePanelRef()
  const blocks = useTransformedBlocks()

  const toggleAiSidebar = () => {
    if (isMobile) {
      setIsAiSidebarOpen((isOpen) => !isOpen)
      return
    }

    const panel = aiSidebarRef.current
    const isCollapsed = panel?.isCollapsed() ?? !isAiSidebarOpen
    if (isCollapsed) panel?.expand()
    else panel?.collapse()
    setIsAiSidebarOpen(isCollapsed)
  }

  const postBlocks = useCallback(() => {
    if (isSupportedPreviewUrl && visualComposerUrl && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(blocks, visualComposerUrl.origin)
    }
  }, [blocks])

  useEffect(() => {
    let active = true
    if (!pageId) {
      loadSavedPage([], null)
      queueMicrotask(() => {
        if (active) setLoading(false)
      })
      return () => {
        active = false
      }
    }

    void loadPage(pageId)
      .then((page) => {
        if (active) loadSavedPage(page.blocks, page.name)
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "The page could not be loaded.")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [loadSavedPage, pageId])

  useEffect(() => {
    postBlocks()
  }, [postBlocks])

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const updateViewport = () => setIsMobile(mediaQuery.matches)

    updateViewport()
    mediaQuery.addEventListener("change", updateViewport)
    return () => mediaQuery.removeEventListener("change", updateViewport)
  }, [])

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Spinner size={32} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-14">
        <Button variant="ghost" asChild className="mb-5">
          <Link to="/content/pages">
            <ArrowLeftIcon />
            Back to pages
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertTitle>Could not load page</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <>
      <main className="flex h-dvh min-h-0 flex-col overflow-hidden bg-background">
        <TopAppBar
          isAiSidebarOpen={isAiSidebarOpen}
          onToggleAiSidebar={toggleAiSidebar}
          pageId={pageId}
          onPageCreated={async (page) => {
            await navigate({
              to: "/content/pages/$pageId",
              params: { pageId: page.id },
              replace: true,
            })
          }}
        />
        {isMobile ? (
          <div
            className={
              isAiSidebarOpen
                ? "grid min-h-0 flex-1 grid-rows-[minmax(360px,1fr)_minmax(280px,auto)] overflow-auto"
                : "min-h-0 flex-1 overflow-auto"
            }
          >
            <div id="ai-chat" className={isAiSidebarOpen ? "h-full" : "hidden"}>
              <ChatBox />
            </div>
            <div className="border-t border-border">
              <RightSidebar />
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1">
            <Group
              orientation="horizontal"
              onLayoutChanged={() => setIsDragging(false)}
              className="h-full min-h-0 w-full"
            >
            <Panel
              id="ai-chat"
              panelRef={aiSidebarRef}
              collapsible
              collapsedSize={0}
              defaultSize={isAiSidebarOpen ? "320px" : 0}
              minSize="280px"
              maxSize="440px"
              onResize={(size) => setIsAiSidebarOpen(size.inPixels > 0)}
              style={{ height: "100%", overflow: "hidden", boxSizing: "border-box" }}
            >
              {isAiSidebarOpen && <ChatBox />}
            </Panel>
            <Separator
              id="ai-chat-resize-handle"
              aria-label="Resize AI assistant and preview"
              className="resize-handle"
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
            />
            <Panel
              id="visual-preview"
              defaultSize="55%"
              minSize="300px"
              className="bg-muted"
              style={{
                height: "100%",
                overflow: "auto",
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              {isSupportedPreviewUrl && visualComposerUrl && (
                <>
                  <UrlAppBar url={visualComposerUrl.origin} />
                  <iframe
                    ref={iframeRef}
                    src={visualComposerUrl.href}
                    onLoad={postBlocks}
                    style={{ width: "100%", height: "calc(100% - 48px)", border: "none" }}
                    title="Visual Composer"
                  />
                </>
              )}
              {isDragging && (
                <div
                  data-testid="iframe-drag-overlay"
                  style={{ position: "absolute", inset: 0, zIndex: 9999 }}
                />
              )}
            </Panel>
            <Separator
              id="properties-resize-handle"
              aria-label="Resize preview and page properties"
              className="resize-handle"
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
            />
            <Panel
              id="page-properties"
              defaultSize="320px"
              minSize="300px"
              style={{ height: "100%", overflow: "auto", boxSizing: "border-box" }}
            >
              <RightSidebar />
            </Panel>
            </Group>
          </div>
        )}
      </main>
    </>
  )
}
