import { useState } from "react"
import { LinkIcon } from "lucide-react"
import type { BlockInput } from "../definition"

import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import { Switch } from "@/ui/switch"
import { Textarea } from "@/ui/textarea"

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
      <div className="mb-4 flex items-center gap-2 pt-1">
        <Switch
          id={name}
          checked={value === true}
          onCheckedChange={(checked) => onChange(name, checked)}
        />
        <Label htmlFor={name} className="cursor-pointer">
          {input.label}
        </Label>
      </div>
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

  const isTextarea = input.type === "textarea"
  const shared = {
    id: name,
    name,
    value: typeof value === "string" || typeof value === "number" ? value : "",
    "aria-invalid": Boolean(error) || undefined,
  }

  return (
    <div className="my-3 grid gap-1.5">
      <Label htmlFor={name}>{input.label}</Label>
      <div className="relative">
        {input.type === "url" && (
          <LinkIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        )}
        {isTextarea ? (
          <Textarea
            {...shared}
            rows={3}
            placeholder={"placeholder" in input ? input.placeholder : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        ) : (
          <Input
            {...shared}
            type={input.type === "number" ? "number" : "text"}
            min={input.type === "number" ? input.min : undefined}
            max={input.type === "number" ? input.max : undefined}
            step={input.type === "number" ? input.step : undefined}
            placeholder={"placeholder" in input ? input.placeholder : undefined}
            className={input.type === "url" ? "pl-9" : undefined}
            onChange={(e) => handleChange(e.target.value)}
          />
        )}
      </div>
      {(error || input.description) && (
        <p className={error ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
          {error || input.description}
        </p>
      )}
      {input.type === "number" && input.suffix ? (
        <p className="text-xs text-muted-foreground">{input.suffix}</p>
      ) : null}
    </div>
  )
}
