import React from "react"
import { TextField, Button } from "@mui/material"

const Card: React.FC = () => {
  return (
    <div>
      <TextField label="Card Title" fullWidth />
      <TextField label="Card Image" fullWidth />
      <TextField label="Card Content" fullWidth multiline />
      <Button variant="contained">Button for Card Footer</Button>
    </div>
  )
}

export default Card
