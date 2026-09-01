import React, { useState } from "react"
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Avatar,
  Box,
  Tooltip,
  Switch,
  FormControlLabel,
  Drawer,
  Snackbar,
  Alert,
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import ViewQuiltOutlinedIcon from "@mui/icons-material/ViewQuiltOutlined"
import { Link } from "@tanstack/react-router"
import BlockTreeView from "./BlockTreeView"
// store
import { useThemeStore, usePageBuilderStore } from "@/store/index"
import { Block } from "@/types/index"
import { savePage, updatePage, type SavedPage } from "@/pages/client/page-api"

type TopAppBarProps = {
  pageId?: string
  onPageCreated?: (page: SavedPage) => Promise<void>
}

const TopAppBar: React.FC<TopAppBarProps> = ({ pageId, onPageCreated }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{
    severity: "success" | "error"
    message: string
  } | null>(null)
  const toggleThemeMode = useThemeStore((state) => state.toggleThemeMode)
  const setActiveBlock = usePageBuilderStore((state) => state.setActiveBlock)
  const setNavigationHistory = usePageBuilderStore(
    (state) => state.setNavigationHistory
  )
  const blocks = usePageBuilderStore((state) => state.blocks)
  const pageName = usePageBuilderStore((state) => state.pageName)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleSetActiveBlock = (block: Block) => {
    setActiveBlock(block)
  }

  const handleNavigationHistoryChange = (history: string[]) => {
    setNavigationHistory(history)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (pageId) await updatePage(pageId, blocks, pageName)
      else if (onPageCreated) await onPageCreated(await savePage(blocks, pageName))
      else await savePage(blocks, pageName)
      setSaveResult({ severity: "success", message: "Page saved." })
    } catch (error) {
      console.error("Failed to save page:", error)
      setSaveResult({
        severity: "error",
        message:
          error instanceof Error
            ? error.message
            : pageId
              ? "The page could not be updated."
              : "The page could not be saved.",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            /home
          </Typography>
          <Tooltip title="Username">
            <Avatar alt="User Avatar" src="/path/to/avatar/image" />
          </Tooltip>
          <Box sx={{ ml: 4 }}>
            <FormControlLabel
              control={<Switch onChange={toggleThemeMode} />}
              label="Dark mode"
            />
          </Box>
          <Box sx={{ mx: 2 }}>
            <Button
              component={Link}
              to="/blocks"
              color="inherit"
              startIcon={<ViewQuiltOutlinedIcon />}
            >
              Block definitions
            </Button>
            <Button color="inherit" disabled={saving} onClick={handleSave}>
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button color="inherit">Publish</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <BlockTreeView
          onBlockItemClick={handleSetActiveBlock}
          onNavigationHistoryChange={handleNavigationHistoryChange}
        />
      </Drawer>
      <Snackbar
        open={saveResult !== null}
        autoHideDuration={6000}
        onClose={() => setSaveResult(null)}
      >
        <Alert
          severity={saveResult?.severity ?? "success"}
          onClose={() => setSaveResult(null)}
        >
          {saveResult?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default TopAppBar
