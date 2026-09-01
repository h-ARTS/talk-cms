import type { Block } from "@/types/index"

export type SavedPage = {
  id: string
  name: string | null
  blocks: Block[]
  createdAt: string
}

export async function listPages(): Promise<SavedPage[]> {
  const response = await fetch("/api/internal/pages")
  const value = await readJson(response, "The pages could not be loaded.")

  if (!response.ok) throw new Error(readApiError(value, "The pages could not be loaded."))
  if (!Array.isArray(value) || !value.every(isSavedPage)) {
    throw new Error("The pages response is invalid.")
  }

  return value
}

export async function loadPage(pageId: string): Promise<SavedPage> {
  const response = await fetch(`/api/content/v1/pages/${encodeURIComponent(pageId)}`)
  const value = await readJson(response, "The page could not be loaded.")

  if (!response.ok) throw new Error(readApiError(value, "The page could not be loaded."))
  if (!isSavedPage(value)) throw new Error("The page response is invalid.")

  return value
}

export async function savePage(
  blocks: Block[],
  name?: string | null
): Promise<SavedPage> {
  const response = await fetch("/api/internal/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks, name: name ?? null }),
  })

  const value = await readJson(response, "The page could not be saved.")
  if (!response.ok) throw new Error(readApiError(value, "The page could not be saved."))
  if (!isSavedPage(value)) throw new Error("The saved page response is invalid.")
  return value
}

export async function updatePage(
  pageId: string,
  blocks: Block[],
  name?: string | null
): Promise<void> {
  const response = await fetch(`/api/internal/pages?id=${encodeURIComponent(pageId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks, name: name ?? null }),
  })
  if (!response.ok) throw new Error(await readError(response, "The page could not be updated."))
}

export async function deletePage(pageId: string): Promise<void> {
  const response = await fetch(`/api/internal/pages?id=${encodeURIComponent(pageId)}`, {
    method: "DELETE",
  })
  if (!response.ok) throw new Error(await readError(response, "The page could not be deleted."))
}

async function readError(
  response: Response,
  fallback = "The page could not be saved."
): Promise<string> {
  try {
    const value: unknown = await response.json()
    if (
      typeof value === "object" &&
      value !== null &&
      "error" in value &&
      typeof value.error === "string"
    ) {
      return value.error
    }
  } catch (error) {
    console.error("Failed to read page save error:", error)
  }
  return fallback
}

function readApiError(value: unknown, fallback: string): string {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback
}

function isSavedPage(value: unknown): value is SavedPage {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.name === null || typeof value.name === "string") &&
    Array.isArray(value.blocks) &&
    value.blocks.every(isBlock) &&
    typeof value.createdAt === "string" &&
    !Number.isNaN(Date.parse(value.createdAt))
  )
}

function isBlock(value: unknown): value is Block {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.type === "string" &&
    (value.parentId === null || typeof value.parentId === "string") &&
    isRecord(value.content) &&
    (value.children === undefined ||
      (Array.isArray(value.children) && value.children.every(isBlock)))
  )
}

async function readJson(response: Response, fallback: string): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw new Error(fallback)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
