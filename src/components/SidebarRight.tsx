import React, { useEffect } from "react"
// Mui
import { Box, Typography, Tabs, Tab } from "@mui/material"
import { useTheme } from "@mui/system"
// Tabs
import TabConfig from "./tabs/TabConfig"
import BlockTree from "./tabs/BlockTree"
// Redux
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/index"
import { setActiveBlock, setNavigationHistory } from "@/store/pageBuilderSlice"
import Breadcrumb from "./Breadcrumb"

const SidebarRight: React.FC = () => {
  const [value, setValue] = React.useState(0)
  const theme = useTheme()
  const currentMode = theme.palette.mode
  const navigationHistory = useSelector(
    (state: RootState) => state.pageBuilder.navigationHistory
  )
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)
  const currentBlock = blocks.find(
    (b) => b.id === navigationHistory[navigationHistory.length - 1]
  )
  const dispatch = useDispatch()

  useEffect(() => {
    if (navigationHistory.length == 0) dispatch(setActiveBlock(null))
    else if (currentBlock) {
      const { type, id } = currentBlock
      dispatch(setActiveBlock({ type, id }))
    }
  }, [currentBlock, dispatch, navigationHistory, navigationHistory.length])

  const handleNavigate = (id: string) => {
    dispatch(setNavigationHistory([...navigationHistory, id]))
  }

  const currentView =
    navigationHistory.length > 0
      ? navigationHistory[navigationHistory.length - 1]
      : null

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
      {navigationHistory.length > 0 && <Breadcrumb />}
      {value === 0 && (
        <BlockTree parentId={currentView} onNavigate={handleNavigate} />
      )}
      {value === 1 && <TabConfig />}
    </Box>
  )
}

export default SidebarRight
