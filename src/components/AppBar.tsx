import React from "react"
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
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { toggleThemeMode } from "../store/themeSlice"
import { useDispatch } from "react-redux"

const TopAppBar: React.FC = () => {
  const dispatch = useDispatch()

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu">
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
  )
}

export default TopAppBar
