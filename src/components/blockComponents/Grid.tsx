import React from "react"
import {
  TextField,
  Grid as MuiGrid,
  Box,
  InputAdornment,
  FormHelperText,
} from "@mui/material"
import { useInputChange } from "@/hooks/useInputChange"

type GridProps = {
  values: { [key: string]: any } | undefined
  onInputChange: (updatedContent: any) => void
}

const Grid: React.FC<GridProps> = ({ onInputChange, values }) => {
  const { margin = 0, padding = 0, columns = 0 } = values || {}
  const handleInputChange = useInputChange(onInputChange)

  return (
    <MuiGrid px={3}>
      <MuiGrid container columnGap={2} my={2}>
        <MuiGrid item xs>
          <TextField
            fullWidth
            label="Margin"
            type="number"
            variant="standard"
            name="margin"
            value={margin}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </MuiGrid>
        <MuiGrid item xs>
          <TextField
            fullWidth
            label="Padding"
            type="number"
            variant="standard"
            name="padding"
            value={padding}
            onChange={handleInputChange}
            InputProps={{
              endAdornment: <InputAdornment position="end">px</InputAdornment>,
            }}
          />
        </MuiGrid>
      </MuiGrid>
      <Box my={2} mb={4}>
        <TextField
          fullWidth
          label="Columns"
          type="number"
          variant="standard"
          name="columns"
          value={columns}
          onChange={handleInputChange}
        />
        <FormHelperText id="max-columns-helper">Max 12 columns.</FormHelperText>
      </Box>
    </MuiGrid>
  )
}

export default Grid
