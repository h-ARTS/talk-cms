import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { useTheme } from '@mui/system'
import { Group, Panel, Separator } from 'react-resizable-panels'
import TopAppBar from '@/components/AppBar'
import UrlAppBar from '@/components/UrlAppBar'
import RightSidebar from '@/components/SidebarRight'
import useTransformedBlocks from '@/hooks/useTransformedBlocks'
import FloatingChatButton from '@/components/FloatingChatButton'
import ChatBox from '@/components/ChatBox'

const visualComposerUrlValue = import.meta.env.VITE_VISUAL_COMPOSER_URL?.trim()
const visualComposerUrl =
    visualComposerUrlValue && URL.canParse(visualComposerUrlValue)
        ? new URL(visualComposerUrlValue)
        : null
const isSupportedPreviewUrl =
    visualComposerUrl?.protocol === 'http:' ||
    visualComposerUrl?.protocol === 'https:'

export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {
    const theme = useTheme()
    const currentMode = theme.palette.mode
    const [isDragging, setIsDragging] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const blocks = useTransformedBlocks()
    const [chatOpen, setChatOpen] = useState(false)

    useEffect(() => {
        console.log(blocks)
        if (
            isSupportedPreviewUrl &&
            visualComposerUrl &&
            iframeRef.current?.contentWindow
        ) {
            iframeRef.current.contentWindow.postMessage(
                blocks,
                visualComposerUrl.origin,
            )
        }
    }, [blocks])

    return (
        <>
            <main
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                }}
            >
                <TopAppBar />
                <div
                    style={{
                        flexGrow: 1,
                        display: 'flex',
                        height: 'calc(100vh - 64px)',
                    }}
                >
                    <Group
                        orientation="horizontal"
                        onLayoutChanged={() => setIsDragging(false)}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <Panel
                            defaultSize="75%"
                            minSize="300px"
                            style={{
                                backgroundColor:
                                    currentMode === 'dark'
                                        ? '#292929'
                                        : 'whitesmoke',
                                height: '100%',
                                overflow: 'auto',
                                boxSizing: 'border-box',
                                position: 'relative',
                            }}
                        >
                            {isSupportedPreviewUrl && visualComposerUrl && (
                                <>
                                    <UrlAppBar url={visualComposerUrl.origin} />
                                    <iframe
                                        ref={iframeRef}
                                        src={visualComposerUrl.href}
                                        style={{
                                            width: '100%',
                                            height: 'calc(100vh - 112px)',
                                            border: 'none',
                                        }}
                                        title="Visual Composer"
                                    />
                                </>
                            )}
                            {isDragging && (
                                <div
                                    data-testid="iframe-drag-overlay"
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        zIndex: 9999,
                                    }}
                                ></div>
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
                            style={{
                                height: '100%',
                                overflow: 'auto',
                                boxSizing: 'border-box',
                            }}
                        >
                            <RightSidebar />
                        </Panel>
                    </Group>
                </div>
            </main>
            <FloatingChatButton chatOpen={chatOpen} onChatOpen={setChatOpen} />
            {chatOpen && (
                <ChatBox chatOpen={chatOpen} onChatOpen={setChatOpen} />
            )}
        </>
    )
}
