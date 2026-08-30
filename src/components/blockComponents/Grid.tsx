import React from "react"
import {
  TextField,
  Grid,
  Box,
  InputAdornment,
  FormHelperText,
} from "@mui/material"
import { useInputChange } from "@/hooks/useInputChange"

type GridProps = {
  values: { [key: string]: any } | undefined
  onInputChange: (updatedContent: any) => void
}

const GridComponent: React.FC<GridProps> = ({ onInputChange, values }) => {
  const { margin = 0, padding = 0, columns = 0 } = values || {}
  const handleInputChange = useInputChange(onInputChange)

  return (
    <Box sx={{ px: 3 }}>
      <Grid container columnSpacing={2} sx={{ my: 2 }}>
        <Grid size={6}>
          <TextField
            fullWidth
            label="Margin"
            type="number"
            variant="standard"
            name="margin"
            value={margin}
            onChange={handleInputChange}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              },
            }}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            fullWidth
            label="Padding"
            type="number"
            variant="standard"
            name="padding"
            value={padding}
            onChange={handleInputChange}
            slotProps={{
              input: {
                endAdornment: <InputAdornment position="end">px</InputAdornment>,
              },
            }}
          />
        </Grid>
      </Grid>
      <Box sx={{ my: 2, mb: 4 }}>
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
    </Box>
  )
}

export default GridComponent
