import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import {
  parseBlockDescriptor,
  validateBlockDescriptors,
  type BlockDescriptor,
} from "../core/descriptor"

const storePath = resolve(
  process.env.BLOCK_DEFINITIONS_FILE ?? "data/block-definitions.json"
)

let mutationQueue = Promise.resolve()

export async function listBlockDescriptors(): Promise<BlockDescriptor[]> {
  try {
    const contents = await readFile(storePath, "utf8")
    const parsed: unknown = JSON.parse(contents)
    if (!Array.isArray(parsed)) throw new Error("Block definition store must be an array")

    const result = validateBlockDescriptors(parsed)
    if (!result.success) throw new Error(result.message)
    return result.data
  } catch (error) {
    if (isMissingFile(error)) return []
    throw error
  }
}

export function createBlockDescriptor(value: unknown): Promise<BlockDescriptor> {
  return enqueueMutation(async () => {
    const descriptor = parseOrThrow(value)
    const descriptors = await listBlockDescriptors()
    if (findByName(descriptors, descriptor.name)) {
      throw new DefinitionStoreError(409, `Duplicate block name: ${descriptor.name}`)
    }

    const nextDescriptors = validateOrThrow([...descriptors, descriptor])
    await writeDescriptors(nextDescriptors)
    return descriptor
  })
}

export function updateBlockDescriptor(
  name: string,
  value: unknown
): Promise<BlockDescriptor> {
  return enqueueMutation(async () => {
    const descriptor = parseOrThrow(value)
    if (descriptor.name.toLowerCase() !== name.toLowerCase()) {
      throw new DefinitionStoreError(400, "Block names cannot be changed")
    }

    const descriptors = await listBlockDescriptors()
    const index = descriptors.findIndex(
      (candidate) => candidate.name.toLowerCase() === name.toLowerCase()
    )
    if (index < 0) throw new DefinitionStoreError(404, `Block not found: ${name}`)

    const nextDescriptors = [...descriptors]
    nextDescriptors[index] = descriptor
    await writeDescriptors(validateOrThrow(nextDescriptors))
    return descriptor
  })
}

export function deleteBlockDescriptor(name: string): Promise<void> {
  return enqueueMutation(async () => {
    const descriptors = await listBlockDescriptors()
    if (!findByName(descriptors, name)) {
      throw new DefinitionStoreError(404, `Block not found: ${name}`)
    }

    const referencedBy = descriptors.filter(
      (descriptor) =>
        descriptor.name.toLowerCase() !== name.toLowerCase() &&
        Array.isArray(descriptor.allowedChildren) &&
        descriptor.allowedChildren.some(
          (childName) => childName.toLowerCase() === name.toLowerCase()
        )
    )
    if (referencedBy.length) {
      throw new DefinitionStoreError(
        409,
        `${name} is referenced by: ${referencedBy.map(({ name }) => name).join(", ")}`
      )
    }

    await writeDescriptors(
      descriptors.filter(
        (descriptor) => descriptor.name.toLowerCase() !== name.toLowerCase()
      )
    )
  })
}

export class DefinitionStoreError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
  }
}

function parseOrThrow(value: unknown) {
  const result = parseBlockDescriptor(value)
  if (!result.success) throw new DefinitionStoreError(400, result.message)
  return result.data
}

function validateOrThrow(values: readonly unknown[]) {
  const result = validateBlockDescriptors(values)
  if (!result.success) throw new DefinitionStoreError(400, result.message)
  return result.data
}

function findByName(descriptors: readonly BlockDescriptor[], name: string) {
  return descriptors.find(
    (descriptor) => descriptor.name.toLowerCase() === name.toLowerCase()
  )
}

async function writeDescriptors(descriptors: readonly BlockDescriptor[]) {
  await mkdir(dirname(storePath), { recursive: true })
  const temporaryPath = `${storePath}.${process.pid}.${crypto.randomUUID()}.tmp`
  await writeFile(temporaryPath, `${JSON.stringify(descriptors, null, 2)}\n`, "utf8")
  await rename(temporaryPath, storePath)
}

function enqueueMutation<T>(mutation: () => Promise<T>): Promise<T> {
  const result = mutationQueue.then(mutation, mutation)
  mutationQueue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT"
}
