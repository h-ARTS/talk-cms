import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftIcon } from "lucide-react"
import { Group, Panel, Separator } from "react-resizable-panels"
import ChatBox from "@/components/ChatBox"
import FloatingChatButton from "@/components/FloatingChatButton"
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
  const [chatOpen, setChatOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const blocks = useTransformedBlocks()

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
        {pageId && (
          <div className="border-b border-border px-3 py-1.5">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/content/pages">
                <ArrowLeftIcon />
                Back to pages
              </Link>
            </Button>
          </div>
        )}
        <TopAppBar
          pageId={pageId}
          onPageCreated={async (page) => {
            await navigate({
              to: "/content/pages/$pageId",
              params: { pageId: page.id },
              replace: true,
            })
          }}
        />
        <div className="min-h-0 flex-1 overflow-auto md:hidden">
          <RightSidebar />
        </div>
        <div className="hidden min-h-0 flex-1 md:flex">
          <Group
            orientation="horizontal"
            onLayoutChanged={() => setIsDragging(false)}
            className="h-full min-h-0 w-full"
          >
            <Panel
              defaultSize="75%"
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
              className="resize-handle"
              onPointerDown={() => setIsDragging(true)}
              onPointerUp={() => setIsDragging(false)}
              onPointerCancel={() => setIsDragging(false)}
            />
            <Panel
              minSize="300px"
              style={{ height: "100%", overflow: "auto", boxSizing: "border-box" }}
            >
              <RightSidebar />
            </Panel>
          </Group>
        </div>
      </main>
      <FloatingChatButton chatOpen={chatOpen} onChatOpen={setChatOpen} />
      {chatOpen && <ChatBox chatOpen={chatOpen} onChatOpen={setChatOpen} />}
    </>
  )
}
