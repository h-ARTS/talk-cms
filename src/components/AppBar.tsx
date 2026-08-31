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
// redux
import { useDispatch, useSelector } from "react-redux"
import { toggleThemeMode } from "@/store/themeSlice"
import { setActiveBlock, setNavigationHistory } from "@/store/pageBuilderSlice"
import { Block } from "@/types/index"
import type { RootState } from "@/store/index"
import { savePage, updatePage, type SavedPage } from "@/pages/client/page-api"

type TopAppBarProps = {
  pageId?: string
  onPageCreated?: (page: SavedPage) => Promise<void>
}

const TopAppBar: React.FC<TopAppBarProps> = ({ pageId, onPageCreated }) => {
  const dispatch = useDispatch()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveResult, setSaveResult] = useState<{
    severity: "success" | "error"
    message: string
  } | null>(null)
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }

  const handleSetActiveBlock = (block: Block) => {
    dispatch(setActiveBlock(block))
  }

  const handleNavigationHistoryChange = (history: string[]) => {
    dispatch(setNavigationHistory(history))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (pageId) await updatePage(pageId, blocks)
      else if (onPageCreated) await onPageCreated(await savePage(blocks))
      else await savePage(blocks)
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
              control={<Switch onChange={() => dispatch(toggleThemeMode())} />}
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
