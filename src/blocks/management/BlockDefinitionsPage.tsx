import { useState } from "react"
import { PlusIcon, Trash2Icon, PencilIcon, BoxesIcon } from "lucide-react"

import { usePageBuilderStore } from "@/store/index"
import { useBlockRegistry } from "../client/block-registry-context"
import {
  createDefinition,
  deleteDefinition,
  updateDefinition,
} from "../client/definition-api"
import type { BlockDescriptor } from "../core/descriptor"
import { compileBlockDefinition } from "../core/compiler"
import { createBlockRegistry } from "../core/registry"
import { validateStoredBlocks } from "../core/validation"
import BlockDefinitionForm from "./BlockDefinitionForm"

import { Alert, AlertDescription, AlertTitle } from "@/ui/alert"
import { Badge } from "@/ui/badge"
import { Button } from "@/ui/button"
import { Card, CardContent, CardHeader } from "@/ui/card"
import { Spinner } from "@/ui/spinner"

export default function BlockDefinitionsPage() {
  const { descriptors, loading, error, refresh } = useBlockRegistry()
  const contentBlocks = usePageBuilderStore((state) => state.blocks)
  const [selected, setSelected] = useState<BlockDescriptor | null>(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const save = async (descriptor: BlockDescriptor) => {
    const usageCount = selected
      ? contentBlocks.filter(
          (block) => block.type.toLowerCase() === selected.name.toLowerCase()
        ).length
      : 0
    if (selected && usageCount > 0) {
      const prospectiveDescriptors = descriptors.map((candidate) =>
        candidate.name.toLowerCase() === selected.name.toLowerCase()
          ? descriptor
          : candidate
      )
      const validation = validateStoredBlocks(
        contentBlocks,
        createBlockRegistry(prospectiveDescriptors.map(compileBlockDefinition))
      )
      if (!validation.success) {
        throw new Error(
          `${selected.metadata.label} is used by ${usageCount} content ${usageCount === 1 ? "block" : "blocks"}. ${validation.message}`
        )
      }
    }

    setSaving(true)
    try {
      if (selected) await updateDefinition(descriptor)
      else await createDefinition(descriptor)
      await refresh()
      setSelected(null)
      setCreating(false)
      setMessage(`${descriptor.metadata.label} saved.`)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (descriptor: BlockDescriptor) => {
    const usageCount = contentBlocks.filter(
      (block) => block.type.toLowerCase() === descriptor.name.toLowerCase()
    ).length
    if (usageCount) {
      setMessage(
        `${descriptor.metadata.label} is used by ${usageCount} content ${usageCount === 1 ? "block" : "blocks"} and cannot be removed.`
      )
      return
    }
    if (!window.confirm(`Remove ${descriptor.metadata.label}?`)) return

    try {
      await deleteDefinition(descriptor.name)
      await refresh()
      if (selected?.name === descriptor.name) setSelected(null)
      setMessage(`${descriptor.metadata.label} removed.`)
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Could not remove block")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              Content architecture
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight md:text-5xl">
              Block definitions
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              Build the reusable content shapes your marketing team uses to compose
              campaigns and landing pages.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => {
              setSelected(null)
              setCreating(true)
            }}
            data-testid="block-create-button"
          >
            <PlusIcon />
            Create definition
          </Button>
        </div>

        {(error || message) && (
          <Alert
            variant={error ? "destructive" : "info"}
            className="mb-6"
            onClose={() => setMessage(null)}
          >
            <AlertTitle>{error ? "Error" : "Notice"}</AlertTitle>
            <AlertDescription>{error ?? message}</AlertDescription>
          </Alert>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(320px,0.8fr)_minmax(560px,1.6fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display text-base font-semibold">Definition library</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {descriptors.length} {descriptors.length === 1 ? "block" : "blocks"} available
                  </p>
                </div>
                <BoxesIcon className="size-5 text-muted-foreground" aria-hidden />
              </div>
            </CardHeader>

            {loading ? (
              <div className="grid place-items-center p-10">
                <Spinner />
              </div>
            ) : descriptors.length === 0 ? (
              <CardContent className="p-10 text-center" data-testid="empty-block-list">
                <p className="font-display text-lg font-semibold">No definitions yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first block to make it available in the page editor.
                </p>
              </CardContent>
            ) : (
              <ul className="divide-y divide-border" data-testid="block-list">
                {descriptors.map((descriptor) => (
                  <li
                    key={descriptor.name}
                    data-testid={`block-row-${descriptor.name}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{descriptor.metadata.label}</p>
                        {descriptor.metadata.category && (
                          <Badge variant="outline">{descriptor.metadata.category}</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {descriptor.name} · {descriptor.fields.length} fields
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Edit ${descriptor.metadata.label}`}
                        onClick={() => {
                          setCreating(false)
                          setSelected(descriptor)
                        }}
                        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${descriptor.metadata.label}`}
                        onClick={() => void remove(descriptor)}
                        data-testid={`block-delete-${descriptor.name}`}
                        className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4"
                      >
                        <Trash2Icon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {creating || selected ? (
            <BlockDefinitionForm
              key={selected?.name ?? "new-definition"}
              definition={selected}
              availableBlocks={descriptors}
              saving={saving}
              onSave={save}
              onCancel={() => {
                setSelected(null)
                setCreating(false)
              }}
            />
          ) : (
            <Card className="border-dashed p-12 text-center">
              <p className="font-display text-xl font-semibold">Select a definition to edit</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Or create a new reusable content block from scratch.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setCreating(true)}>
                <PlusIcon />
                Create definition
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
