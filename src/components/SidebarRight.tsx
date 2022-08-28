import React from "react"
import { Box, Typography, Tabs, Tab } from "@mui/material"
import { useTheme } from "@mui/system"
const RightSidebar: React.FC = () => {
  const [value, setValue] = React.useState(0)
  const theme = useTheme()
  const currentMode = theme.palette.mode

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: currentMode === "dark" ? "dark" : "white",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h6"
        component="div"
        sx={{ textAlign: "center", py: 2 }}
      >
        Landingpage
      </Typography>
      <Tabs
        value={value}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
      >
        <Tab label="Blocks" />
        <Tab label="Config" />
      </Tabs>
    </Box>
  )
}
