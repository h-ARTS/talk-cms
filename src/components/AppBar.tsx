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
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { toggleThemeMode } from "../store/themeSlice"
import { useDispatch } from "react-redux"
import BlockTreeView from "./BlockTreeView"

const TopAppBar: React.FC = () => {
  const dispatch = useDispatch()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
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
          <Box ml={4}>
            <FormControlLabel
              control={<Switch onChange={() => dispatch(toggleThemeMode())} />}
              label="Dark mode"
            />
          </Box>
          <Box sx={{ mx: 2 }}>
            <Button color="inherit">Save</Button>
            <Button color="inherit">Publish</Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <BlockTreeView />
      </Drawer>
    </>
  )
}

export default TopAppBar
