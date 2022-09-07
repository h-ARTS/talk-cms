import React from "react"
import { TextField, Switch, FormControlLabel } from "@mui/material"

const Teaser: React.FC = () => {
  return (
    <div>
      <FormControlLabel control={<Switch />} label="Fluid" />
      <TextField label="Background Color" fullWidth />
      <TextField label="Padding" type="number" fullWidth />
      <TextField label="Margin" type="number" fullWidth />
    </div>
  )
}

export default Teaser
