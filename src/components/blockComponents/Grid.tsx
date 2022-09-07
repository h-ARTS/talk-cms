import React from "react"
import { TextField, Grid as MuiGrid, Box } from "@mui/material"

const Grid: React.FC = () => {
  return (
    <MuiGrid px={3}>
      <Box my={2}>
        <TextField label="Margin" type="number" variant="standard" fullWidth />
      </Box>
      <Box my={2}>
        <TextField label="Padding" type="number" variant="standard" fullWidth />
      </Box>
      <Box my={2} mb={4}>
        <TextField label="Columns" type="number" variant="standard" fullWidth />
      </Box>
    </MuiGrid>
  )
}

export default Grid
