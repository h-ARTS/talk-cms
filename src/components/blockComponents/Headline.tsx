import React from "react"
import { TextField, Grid, Box, InputAdornment } from "@mui/material"
import { useInputChange } from "@/hooks/useInputChange"
import { useUrlInputChange } from "@/hooks/useUrlInputChange"
import LinkIcon from "@mui/icons-material/Link"

type HeadlineProps = {
  values: { [key: string]: any } | undefined
  onInputChange: (updatedContent: any) => void
}

const Headline: React.FC<HeadlineProps> = ({ onInputChange, values }) => {
  const {
    title = "",
    subtitle = "",
    cta_button_label = "",
    bg_image_url = "",
  } = values || {}
  const handleInputChange = useInputChange(onInputChange)
  const { handleUrlInputChange, urlError } = useUrlInputChange(onInputChange)

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
      <Box mt={2} mb={4}>
        <TextField
          label="Background Image URL"
          name="bg_image_url"
          fullWidth
          variant="standard"
          value={bg_image_url}
          onChange={handleUrlInputChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon />
              </InputAdornment>
            ),
            placeholder: "http(s)://...",
          }}
          error={urlError}
          helperText={urlError ? "Please enter a valid URL" : ""}
        />
      </Box>
    </Grid>
  )
}

export default Headline
