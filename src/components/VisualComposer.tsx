import { useCallback, useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { Alert, Box, Button, CircularProgress } from "@mui/material"
import { useTheme } from "@mui/system"
import { Group, Panel, Separator } from "react-resizable-panels"
import ChatBox from "@/components/ChatBox"
import FloatingChatButton from "@/components/FloatingChatButton"
import TopAppBar from "@/components/AppBar"
import RightSidebar from "@/components/SidebarRight"
import UrlAppBar from "@/components/UrlAppBar"
import useTransformedBlocks from "@/hooks/useTransformedBlocks"
import { loadPage } from "@/pages/client/page-api"
import { usePageBuilderStore } from "@/store/index"

const visualComposerUrlValue = import.meta.env.VITE_VISUAL_COMPOSER_URL?.trim()
const visualComposerUrl =
  visualComposerUrlValue && URL.canParse(visualComposerUrlValue)
    ? new URL(visualComposerUrlValue)
    : null
const isSupportedPreviewUrl =
  visualComposerUrl?.protocol === "http:" || visualComposerUrl?.protocol === "https:"

export default function VisualComposer({ pageId }: { pageId?: string }) {
  const loadSavedPage = usePageBuilderStore((state) => state.loadSavedPage)
  const navigate = useNavigate()
  const theme = useTheme()
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
      loadSavedPage([])
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
    return <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}><CircularProgress /></Box>
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 680, mx: "auto", py: 8, px: 3 }}>
        <Button component={Link} to="/content/pages" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }}>
          Back to pages
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <>
      <main style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {pageId && (
          <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: "divider" }}>
            <Button component={Link} to="/content/pages" startIcon={<ArrowBackIcon />}>
              Back to pages
            </Button>
          </Box>
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
        <div style={{ flexGrow: 1, display: "flex", height: pageId ? "calc(100vh - 113px)" : "calc(100vh - 64px)" }}>
          <Group orientation="horizontal" onLayoutChanged={() => setIsDragging(false)} style={{ height: "100%", width: "100%" }}>
            <Panel
              defaultSize="75%"
              minSize="300px"
              style={{
                backgroundColor: theme.palette.mode === "dark" ? "#292929" : "whitesmoke",
                height: "100%",
                overflow: "auto",
                boxSizing: "border-box",
                position: "relative",
              }}
            >
              {isSupportedPreviewUrl && visualComposerUrl && (
                <>
                  <UrlAppBar url={visualComposerUrl.origin} />
                  <iframe ref={iframeRef} src={visualComposerUrl.href} onLoad={postBlocks} style={{ width: "100%", height: "calc(100% - 48px)", border: "none" }} title="Visual Composer" />
                </>
              )}
              {isDragging && <div data-testid="iframe-drag-overlay" style={{ position: "absolute", inset: 0, zIndex: 9999 }} />}
            </Panel>
            <Separator className="resize-handle" onPointerDown={() => setIsDragging(true)} onPointerUp={() => setIsDragging(false)} onPointerCancel={() => setIsDragging(false)} />
            <Panel minSize="300px" style={{ height: "100%", overflow: "auto", boxSizing: "border-box" }}>
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
