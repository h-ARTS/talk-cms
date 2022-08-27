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
} from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"

const TopAppBar: React.FC = () => {

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
        <Box sx={{ mx: 2 }}>
          <Button color="inherit">Save</Button>
          <Button color="inherit">Publish</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default TopAppBar
