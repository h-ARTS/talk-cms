import React from "react"
import { TextField, Grid, Box } from "@mui/material"

const Headline: React.FC = () => {
  return (
    <Grid px={3}>
      <Box my={2}>
        <TextField label="Title" fullWidth variant="standard" />
      </Box>
      <Box my={2}>
        <TextField label="Subtitle" fullWidth variant="standard" />
      </Box>
      <Box mt={2} mb={4}>
        <TextField label="Call to Action Button" fullWidth variant="standard" />
      </Box>
    </Grid>
  )
}

export default Headline
