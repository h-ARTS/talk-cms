import { useState } from "react"
import LinkIcon from "@mui/icons-material/Link"
import {
  Box,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
} from "@mui/material"
import type { BlockInput } from "../definition"

type BlockFieldProps = {
  name: string
  input: BlockInput
  value: unknown
  onChange: (name: string, value: string | number | boolean) => void
}

export default function BlockField({
  name,
  input,
  value,
  onChange,
}: BlockFieldProps) {
  const [error, setError] = useState("")

  if (input.type === "boolean") {
    return (
      <Box sx={{ pt: 1, mb: 3 }}>
        <FormControlLabel
          control={
            <Switch
              name={name}
              checked={value === true}
              onChange={(event) => onChange(name, event.target.checked)}
            />
          }
          label={input.label}
        />
      </Box>
    )
  }

  const handleChange = (rawValue: string) => {
    if (input.type === "number") {
      if (rawValue === "") return
      onChange(name, Number(rawValue))
      return
    }

    if (input.type === "url" && rawValue) {
      try {
        new URL(rawValue)
        setError("")
      } catch {
        setError("Please enter a valid URL")
      }
    } else {
      setError("")
    }
    onChange(name, rawValue)
  }

  return (
    <Box sx={{ my: 2 }}>
      <TextField
        fullWidth
        variant="standard"
        name={name}
        label={input.label}
        type={input.type === "number" ? "number" : "text"}
        multiline={input.type === "textarea"}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        onChange={(event) => handleChange(event.target.value)}
        error={Boolean(error)}
        helperText={error || input.description}
        slotProps={{
          htmlInput: {
            min: input.type === "number" ? input.min : undefined,
            max: input.type === "number" ? input.max : undefined,
            step: input.type === "number" ? input.step : undefined,
            placeholder: "placeholder" in input ? input.placeholder : undefined,
          },
          input: {
            startAdornment:
              input.type === "url" ? (
                <InputAdornment position="start">
                  <LinkIcon />
                </InputAdornment>
              ) : undefined,
            endAdornment:
              input.type === "number" && input.suffix ? (
                <InputAdornment position="end">{input.suffix}</InputAdornment>
              ) : undefined,
          },
        }}
      />
    </Box>
  )
}
