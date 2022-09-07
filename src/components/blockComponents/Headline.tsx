import React from "react"
import { TextField, Button } from "@mui/material"

const Headline: React.FC = () => {
  return (
    <div>
      <TextField label="Title" fullWidth />
      <TextField label="Subtitle" fullWidth />
      <Button variant="contained">Call to action</Button>
    </div>
  )
}

export default Headline
