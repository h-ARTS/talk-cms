import React from "react"
import { TextField, Grid, Box } from "@mui/material"

type HeadlineProps = {
  values: { [key: string]: any } | undefined
  onInputChange: (updatedContent: any) => void
}

const Headline: React.FC<HeadlineProps> = ({ onInputChange, values }) => {
  const { title, subtitle, cta_button_label } = values || {}

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    onInputChange({ [name]: value })
  }

  return (
    <Grid px={3}>
      <Box my={2}>
        <TextField
          label="Title"
          name="title"
          fullWidth
          variant="standard"
          value={title}
          onChange={handleInputChange}
        />
      </Box>
      <Box my={2}>
        <TextField
          label="Subtitle"
          name="subtitle"
          fullWidth
          variant="standard"
          value={subtitle}
          onChange={handleInputChange}
        />
      </Box>
      <Box mt={2} mb={4}>
        <TextField
          label="Call to Action Button"
          name="cta_button_label"
          fullWidth
          variant="standard"
          value={cta_button_label}
          onChange={handleInputChange}
        />
      </Box>
    </Grid>
  )
}

export default Headline
