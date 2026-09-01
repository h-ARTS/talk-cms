import React from "react"
import { Box, TextField, Typography } from "@mui/material"
import { usePageBuilderStore } from "@/store/index"

const TabConfig: React.FC = () => {
  const pageName = usePageBuilderStore((state) => state.pageName)
  const setPageName = usePageBuilderStore((state) => state.setPageName)

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle1">Page configuration</Typography>
      <TextField
        label="Name"
        size="small"
        fullWidth
        value={pageName}
        onChange={(event) => setPageName(event.target.value)}
        helperText='A human-readable name for this page, e.g. "home". Saved with the page.'
        slotProps={{ htmlInput: { "data-testid": "page-name-input" } }}
      />
    </Box>
  )
}

export default TabConfig
