import React from "react"
import { TextField, Switch, FormControlLabel, Grid, Box } from "@mui/material"

const Teaser: React.FC = () => {
  return (
    <Grid px={3}>
      <Box my={2}>
        <TextField label="Margin" type="number" fullWidth variant="standard" />
      </Box>
      <Box my={2}>
        <TextField label="Padding" type="number" fullWidth variant="standard" />
      </Box>
      <Box my={2}>
        <TextField label="Background Color" fullWidth variant="standard" />
      </Box>
      <Box pt={1} mb={3}>
        <FormControlLabel control={<Switch />} label="Fluid" />
      </Box>
    </Grid>
  )
}

export default Teaser
