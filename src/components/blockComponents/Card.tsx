import React from "react"
import { TextField, Grid, Box } from "@mui/material"
import { useInputChange } from "@/src/hooks/useInputChange"

type CardProps = {
  values: { [key: string]: any } | undefined
  onInputChange: (updatedContent: any) => void
}

const Card: React.FC<CardProps> = ({ onInputChange, values }) => {
  const { title, content, image_url, btn_label } = values || {}
  const handleInputChange = useInputChange(onInputChange)

  return (
    <Grid px={3}>
      <Box my={2}>
        <TextField
          label="Card Title"
          name="title"
          fullWidth
          variant="standard"
          value={title}
          onChange={handleInputChange}
        />
      </Box>
      <Box my={2}>
        <TextField
          label="Card Content"
          name="content"
          fullWidth
          multiline
          variant="standard"
          value={content}
          onChange={handleInputChange}
        />
      </Box>
      <Box my={2}>
        <TextField
          label="Card Image"
          name="image_url"
          fullWidth
          variant="standard"
          value={image_url}
          onChange={handleInputChange}
        />
      </Box>
      <Box mt={2} mb={4}>
        <TextField
          label="Button Label"
          name="btn_label"
          fullWidth
          variant="standard"
          value={btn_label}
          onChange={handleInputChange}
        />
      </Box>
    </Grid>
  )
}

export default Card
