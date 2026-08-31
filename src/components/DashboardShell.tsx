import { useState, type ReactNode } from "react"
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import MenuIcon from "@mui/icons-material/Menu"
import ViewQuiltOutlinedIcon from "@mui/icons-material/ViewQuiltOutlined"
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material"
import DashboardNavigationLink from "@/components/DashboardNavigationLink"

const drawerWidth = 240
const navigation = [
  { label: "Dashboard", to: "/", icon: <DashboardOutlinedIcon /> },
  { label: "Pages", to: "/content/pages", icon: <DescriptionOutlinedIcon /> },
  { label: "Block definitions", to: "/blocks", icon: <ViewQuiltOutlinedIcon /> },
] as const

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigationContent = (
    <>
      <Box sx={{ px: 3, py: 3.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Talk CMS
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Content workspace
        </Typography>
      </Box>
      <List component="nav" aria-label="Main navigation" sx={{ p: 1.5 }}>
        {navigation.map((item) => (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <DashboardNavigationLink
              to={item.to}
              activeOptions={{ exact: true }}
              onClick={() => setMobileOpen(false)}
              sx={{ borderRadius: 2, width: "100%" }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </DashboardNavigationLink>
          </ListItem>
        ))}
      </List>
    </>
  )

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        component="header"
        sx={{
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          position: "fixed",
          inset: "0 0 auto 0",
          height: 64,
          px: 2,
          zIndex: (theme) => theme.zIndex.appBar,
          bgcolor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <IconButton aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>Talk CMS</Typography>
      </Box>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: "block", md: "none" } }}
        slotProps={{ paper: { sx: { width: drawerWidth } } }}
      >
        {navigationContent}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        {navigationContent}
      </Drawer>
      <Box
        component="main"
        sx={{ flexGrow: 1, minWidth: 0, pt: { xs: 8, md: 0 } }}
      >
        {children}
      </Box>
    </Box>
  )
}
