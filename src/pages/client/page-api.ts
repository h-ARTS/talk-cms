import type { Block } from "@/types/index"

export async function savePage(blocks: Block[]): Promise<void> {
  const response = await fetch("/api/internal/pages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ blocks }),
  })

  if (!response.ok) throw new Error(await readError(response))
}

async function readError(response: Response): Promise<string> {
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
  return "The page could not be saved."
}
