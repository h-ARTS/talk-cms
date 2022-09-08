import React from "react"
import {
  TextField,
  Switch,
  FormControlLabel,
  Grid,
  Box,
  InputAdornment,
} from "@mui/material"
import { useInputChange } from "@/src/hooks/useInputChange"

type TeaserProps = {
  values: { [key: string]: any } | undefined
  onInputChange: (updatedContent: any) => void
}

const Teaser: React.FC<TeaserProps> = ({ onInputChange, values }) => {
  const { margin = 0, padding = 0, bg_color = "", fluid } = values || {}
  const handleInputChange = useInputChange(onInputChange)

  return (
    <Grid px={3}>
      <Grid container columnGap={2} my={2}>
        <Grid item xs>
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
        </Grid>
        <Grid item xs>
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
        </Grid>
      </Grid>
      <Box my={2}>
        <TextField
          fullWidth
          label="Background Color"
          variant="standard"
          name="background_color"
          value={bg_color}
          onChange={handleInputChange}
        />
      </Box>
      <Box pt={1} mb={3}>
        <FormControlLabel
          control={
            <Switch
              name="fluid"
              checked={fluid || false}
              onChange={handleInputChange}
            />
          }
          label="Fluid"
        />
      </Box>
    </Grid>
  )
}

export default Teaser
