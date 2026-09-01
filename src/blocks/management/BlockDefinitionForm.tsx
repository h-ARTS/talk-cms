import { useState } from "react"
import { PlusIcon, Trash2Icon } from "lucide-react"

import {
  parseBlockDescriptor,
  type BlockDescriptor,
  type FieldDescriptor,
} from "../core/descriptor"

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { Button } from "@/ui/button"
import { Card, CardContent } from "@/ui/card"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select"
import { Separator } from "@/ui/separator"
import { Switch } from "@/ui/switch"
import { Textarea } from "@/ui/textarea"

type BlockDefinitionFormProps = {
  definition: BlockDescriptor | null
  availableBlocks: readonly BlockDescriptor[]
  saving: boolean
  onSave: (descriptor: BlockDescriptor) => Promise<void>
  onCancel: () => void
}

type FieldDraft = {
  key: string
  label: string
  type: FieldDescriptor["type"]
  defaultValue: string | boolean
  description: string
  min: string
  max: string
}

const emptyField = (): FieldDraft => ({
  key: "",
  label: "",
  type: "text",
  defaultValue: "",
  description: "",
  min: "",
  max: "",
})

const fieldTypeOptions: { value: FieldDescriptor["type"]; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "url", label: "URL" },
  { value: "color", label: "Color" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Toggle" },
]

export default function BlockDefinitionForm({
  definition,
  availableBlocks,
  saving,
  onSave,
  onCancel,
}: BlockDefinitionFormProps) {
  const [name, setName] = useState(definition?.name ?? "")
  const [label, setLabel] = useState(definition?.metadata.label ?? "")
  const [description, setDescription] = useState(
    definition?.metadata.description ?? ""
  )
  const [category, setCategory] = useState(
    definition?.metadata.category ?? ""
  )
  const [childMode, setChildMode] = useState<"none" | "any" | "specific">(
    definition?.allowedChildren === true
      ? "any"
      : Array.isArray(definition?.allowedChildren)
        ? "specific"
        : "none"
  )
  const [allowedChildren, setAllowedChildren] = useState<string[]>(
    Array.isArray(definition?.allowedChildren)
      ? [...definition.allowedChildren]
      : []
  )
  const [fields, setFields] = useState<FieldDraft[]>(
    definition ? definition.fields.map(toFieldDraft) : [emptyField()]
  )
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const candidate = {
      name,
      metadata: {
        label,
        description: description || undefined,
        category: category || undefined,
      },
      fields: fields.map(toFieldDescriptor),
      allowedChildren:
        childMode === "any"
          ? true
          : childMode === "specific"
            ? allowedChildren
            : false,
    }
    const parsed = parseBlockDescriptor(candidate)
    if (!parsed.success) {
      setError(parsed.message)
      return
    }

    setError(null)
    try {
      await onSave(parsed.data)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save block")
    }
  }

  const toggleAllowedChild = (childName: string) => {
    setAllowedChildren((current) =>
      current.includes(childName)
        ? current.filter((c) => c !== childName)
        : [...current, childName]
    )
  }

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-widest text-primary">
          {definition ? "Edit definition" : "New definition"}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
          {definition ? definition.metadata.label : "Create a content block"}
        </h2>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">
          Describe the fields your marketing team will fill in when composing a page.
        </p>

        {error && (
          <Alert variant="destructive" className="mb-5">
            <AlertTitle>Invalid definition</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="block-name">
                Technical name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="block-name"
                required
                value={name}
                disabled={Boolean(definition)}
                onChange={(e) => setName(e.target.value)}
                data-testid="block-name"
              />
              <p className="text-xs text-muted-foreground">
                Stable identifier, for example HeroBanner
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="block-label">
                Display name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="block-label"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                data-testid="block-label"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="block-desc">Description</Label>
            <Textarea
              id="block-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="block-category">Category</Label>
            <Input
              id="block-category"
              placeholder="Campaign, Editorial, Layout..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        <Separator className="my-7" />

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-base font-semibold">Content fields</h3>
            <p className="text-sm text-muted-foreground">
              These become the inputs shown in the visual editor.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFields((current) => [...current, emptyField()])}
            data-testid="add-field"
          >
            <PlusIcon />
            Add field
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {fields.map((field, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-muted/40 p-4"
            >
              <div className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto]">
                  <div className="grid gap-1.5">
                    <Label htmlFor={`field-key-${index}`}>
                      Field key <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`field-key-${index}`}
                      required
                      value={field.key}
                      onChange={(e) => updateField(index, { key: e.target.value }, setFields)}
                      data-testid={`field-key-${index}`}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor={`field-label-${index}`}>
                      Field label <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`field-label-${index}`}
                      required
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value }, setFields)}
                      data-testid={`field-label-${index}`}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>Input type</Label>
                    <Select
                      value={field.type}
                      onValueChange={(value) =>
                        updateField(
                          index,
                          {
                            type: value as FieldDescriptor["type"],
                            defaultValue: value === "boolean" ? false : "",
                          },
                          setFields
                        )
                      }
                    >
                      <SelectTrigger data-testid={`field-type-${index}`} className="w-full min-w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      aria-label={`Remove field ${index + 1}`}
                      onClick={() =>
                        setFields((current) => current.filter((_, i) => i !== index))
                      }
                      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4"
                    >
                      <Trash2Icon />
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {field.type === "boolean" ? (
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`field-default-${index}`}
                        checked={field.defaultValue === true}
                        onCheckedChange={(checked) =>
                          updateField(index, { defaultValue: checked }, setFields)
                        }
                      />
                      <Label htmlFor={`field-default-${index}`} className="cursor-pointer">
                        Enabled by default
                      </Label>
                    </div>
                  ) : (
                    <div className="grid gap-1.5">
                      <Label htmlFor={`field-default-${index}`}>Default value</Label>
                      <Input
                        id={`field-default-${index}`}
                        type={field.type === "number" ? "number" : "text"}
                        value={String(field.defaultValue)}
                        onChange={(e) =>
                          updateField(index, { defaultValue: e.target.value }, setFields)
                        }
                        data-testid={`field-default-${index}`}
                      />
                    </div>
                  )}
                  {field.type === "number" && (
                    <>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`field-min-${index}`}>Minimum</Label>
                        <Input
                          id={`field-min-${index}`}
                          type="number"
                          value={field.min}
                          onChange={(e) => updateField(index, { min: e.target.value }, setFields)}
                        />
                      </div>
                      <div className="grid gap-1.5">
                        <Label htmlFor={`field-max-${index}`}>Maximum</Label>
                        <Input
                          id={`field-max-${index}`}
                          type="number"
                          value={field.max}
                          onChange={(e) => updateField(index, { max: e.target.value }, setFields)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-7" />

        <h3 className="mb-3 font-display text-base font-semibold">Nested blocks</h3>
        <div className="grid gap-1.5">
          <Label>Allowed children</Label>
          <Select
            value={childMode}
            onValueChange={(value) => setChildMode(value as typeof childMode)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No nested blocks</SelectItem>
              <SelectItem value="any">Any defined block</SelectItem>
              <SelectItem value="specific">Specific blocks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {childMode === "specific" && (
          <div className="mt-4 grid gap-2">
            <Label>Block types</Label>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              {availableBlocks
                .filter((candidate) => candidate.name !== definition?.name)
                .map((candidate) => (
                  <label
                    key={candidate.name}
                    className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-150 hover:bg-accent"
                  >
                    <input
                      type="checkbox"
                      checked={allowedChildren.includes(candidate.name)}
                      onChange={() => toggleAllowedChild(candidate.name)}
                      className="size-4 cursor-pointer accent-[#22c55e]"
                    />
                    {candidate.metadata.label}
                  </label>
                ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-2">
          {definition && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            size="lg"
            disabled={saving}
            onClick={() => void submit()}
            data-testid="save-block-definition"
          >
            {saving ? "Saving..." : definition ? "Save changes" : "Create block"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function updateField(
  index: number,
  update: Partial<FieldDraft>,
  setFields: React.Dispatch<React.SetStateAction<FieldDraft[]>>
) {
  setFields((current) =>
    current.map((field, fieldIndex) =>
      fieldIndex === index ? { ...field, ...update } : field
    )
  )
}

function toFieldDraft(field: FieldDescriptor): FieldDraft {
  return {
    key: field.key,
    label: field.label,
    type: field.type,
    defaultValue:
      typeof field.default === "number" ? String(field.default) : field.default,
    description: field.description ?? "",
    min: field.type === "number" && field.min !== undefined ? String(field.min) : "",
    max: field.type === "number" && field.max !== undefined ? String(field.max) : "",
  }
}

function toFieldDescriptor(field: FieldDraft): unknown {
  const common = {
    key: field.key,
    label: field.label,
    type: field.type,
    description: field.description || undefined,
  }
  if (field.type === "boolean") return { ...common, default: field.defaultValue === true }
  if (field.type === "number") {
    return {
      ...common,
      default: Number(field.defaultValue),
      min: field.min === "" ? undefined : Number(field.min),
      max: field.max === "" ? undefined : Number(field.max),
    }
  }
  return { ...common, default: String(field.defaultValue) }
}
