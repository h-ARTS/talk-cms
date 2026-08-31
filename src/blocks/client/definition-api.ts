import {
  parseBlockDescriptor,
  type BlockDescriptor,
} from "../core/descriptor"

export async function createDefinition(descriptor: BlockDescriptor) {
  return requestDefinition("/api/block-definitions", "POST", descriptor)
}

export async function updateDefinition(descriptor: BlockDescriptor) {
  return requestDefinition(
    `/api/block-definitions?name=${encodeURIComponent(descriptor.name)}`,
    "PUT",
    descriptor
  )
}

export async function deleteDefinition(name: string) {
  const response = await fetch(
    `/api/block-definitions?name=${encodeURIComponent(name)}`,
    { method: "DELETE" }
  )
  if (!response.ok) throw new Error(await readError(response))
}

async function requestDefinition(
  url: string,
  method: "POST" | "PUT",
  descriptor: BlockDescriptor
) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(descriptor),
  })
  const value: unknown = await response.json()
  if (!response.ok) throw new Error(readErrorValue(value))

  const parsed = parseBlockDescriptor(value)
  if (!parsed.success) throw new Error(parsed.message)
  return parsed.data
}

async function readError(response: Response) {
  try {
    return readErrorValue(await response.json())
  } catch {
    return `Request failed with status ${response.status}`
  }
}

function readErrorValue(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error
  }
  return "The block definition could not be saved"
}
