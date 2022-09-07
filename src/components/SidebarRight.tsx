import React, { useState } from "react"
import { Box, Typography, Tabs, Tab, Button } from "@mui/material"
import TabConfig from "./tabs/TabConfig"
import { useTheme } from "@mui/system"
import BlockTree from "./tabs/BlockTree"

const RightSidebar: React.FC = () => {
  const [value, setValue] = React.useState(0)
  const theme = useTheme()
  const currentMode = theme.palette.mode
  const [navStack, setNavStack] = useState<string[]>([])

  const handleNavigate = (id: string) => {
    setNavStack((prevStack) => [...prevStack, id])
  }

  const handleNavigateBack = () => {
    setNavStack((prevStack) => prevStack.slice(0, -1))
  }

  const currentView = navStack.length > 0 ? navStack[navStack.length - 1] : null

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
      {navStack.length > 0 && (
        <Box mb={2}>
          <Button variant="outlined" onClick={handleNavigateBack}>
            Back
          </Button>
        </Box>
      )}
      {value === 0 && (
        <BlockTree parentId={currentView} onNavigate={handleNavigate} />
      )}
      {value === 1 && <TabConfig />}
    </Box>
  )
}

export default RightSidebar
