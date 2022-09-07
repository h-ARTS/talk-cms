import React from "react"
import { TextField } from "@mui/material"

const Grid: React.FC = () => {
  return (
    <div>
      <TextField label="Columns" type="number" fullWidth />
      <TextField label="Padding" type="number" fullWidth />
      <TextField label="Margin" type="number" fullWidth />
    </div>
  )
}

export default Grid
