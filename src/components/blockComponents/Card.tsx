import React from "react"
import { TextField, Grid, Box } from "@mui/material"

const Card: React.FC = () => {
  return (
    <Grid px={3}>
      <Box my={2}>
        <TextField label="Card Title" fullWidth variant="standard" />
      </Box>
      <Box my={2}>
        <TextField label="Card Image" fullWidth variant="standard" />
      </Box>
      <Box my={2}>
        <TextField
          label="Card Content"
          fullWidth
          variant="standard"
          multiline
        />
      </Box>
      <Box mt={2} mb={4}>
        <TextField label="Button Label" fullWidth variant="standard" />
      </Box>
    </Grid>
  )
}

export default Card
