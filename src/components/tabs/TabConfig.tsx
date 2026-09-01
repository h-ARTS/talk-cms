import React from "react"
import { Box, TextField, Typography } from "@mui/material"
import { usePageBuilderStore } from "@/store/index"

const TabConfig: React.FC = () => {
  const pageAlias = usePageBuilderStore((state) => state.pageAlias)
  const setPageAlias = usePageBuilderStore((state) => state.setPageAlias)

  return (
    <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="subtitle1">Page configuration</Typography>
      <TextField
        label="Alias"
        size="small"
        fullWidth
        value={pageAlias}
        onChange={(event) => setPageAlias(event.target.value)}
        helperText='A human-readable alias for this page, e.g. "home". Saved with the page.'
        slotProps={{ htmlInput: { "data-testid": "page-alias-input" } }}
      />
    </Box>
  )
}

export default TabConfig
