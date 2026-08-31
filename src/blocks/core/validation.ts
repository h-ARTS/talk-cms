import type { Block } from "@/types/index"
import type { BlockRegistry } from "./registry"
import type { ValidationResult } from "./validation-result"

export type GeneratedBlock = {
  type: string
  content: Record<string, unknown>
  children: GeneratedBlock[]
}

const MAX_BLOCK_COUNT = 100
const MAX_BLOCK_DEPTH = 20

export function validateGeneratedBlocks(
  value: unknown,
  blockRegistry: BlockRegistry
): ValidationResult<GeneratedBlock[]> {
  if (!Array.isArray(value)) {
    return invalid("Generated page must be an array of blocks.")
  }

  let blockCount = 0

  function validateNode(
    candidate: unknown,
    depth: number,
    parentType?: string
  ): ValidationResult<GeneratedBlock> {
    if (depth > MAX_BLOCK_DEPTH) {
      return invalid(`Generated page exceeds the maximum depth of ${MAX_BLOCK_DEPTH}.`)
    }
    if (!isRecord(candidate) || typeof candidate.type !== "string") {
      return invalid("Each generated block must contain a string type.")
    }

    blockCount += 1
    if (blockCount > MAX_BLOCK_COUNT) {
      return invalid(`Generated page exceeds the maximum of ${MAX_BLOCK_COUNT} blocks.`)
    }

    const definition = blockRegistry.get(candidate.type)
    if (!definition) {
      const similar = findSimilarBlockName(candidate.type, blockRegistry)
      return invalid(
        similar
          ? `No ${candidate.type} block found. Similar block found: "${similar}".`
          : `No ${candidate.type} block found in the project.`
      )
    }

    if (parentType && !blockRegistry.allowsChild(parentType, definition.name)) {
      return invalid(`${definition.name} is not allowed inside ${parentType}.`)
    }

    const contentResult = definition.schema.safeParse(candidate.content ?? {})
    if (!contentResult.success) {
      return invalid(
        `Invalid ${definition.name} content: ${contentResult.error.issues
          .map((issue) => `${issue.path.join(".") || "content"}: ${issue.message}`)
          .join(", ")}`
      )
    }

    const childCandidates = candidate.children ?? []
    if (!Array.isArray(childCandidates)) {
      return invalid(`${definition.name} children must be an array.`)
    }

    const children: GeneratedBlock[] = []
    for (const childCandidate of childCandidates) {
      const childResult = validateNode(childCandidate, depth + 1, definition.name)
      if (!childResult.success) return childResult
      children.push(childResult.data)
    }

    return {
      success: true,
      data: {
        type: definition.name,
        content: contentResult.data,
        children,
      },
    }
  }

  const blocks: GeneratedBlock[] = []
  for (const candidate of value) {
    const result = validateNode(candidate, 1)
    if (!result.success) return result
    blocks.push(result.data)
  }

  return { success: true, data: blocks }
}

export function validateStoredBlocks(
  value: unknown,
  blockRegistry: BlockRegistry
): ValidationResult<Block[]> {
  if (!Array.isArray(value)) return invalid("Block response must be an array.")

  const blocks: Block[] = []
  const ids = new Set<string>()

  for (const candidate of value) {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== "string" ||
      typeof candidate.type !== "string" ||
      !(candidate.parentId === null || typeof candidate.parentId === "string")
    ) {
      return invalid("Block response contains an invalid block envelope.")
    }
    if (ids.has(candidate.id)) return invalid(`Duplicate block id: ${candidate.id}`)

    const definition = blockRegistry.get(candidate.type)
    if (!definition) return invalid(`Unknown block type: ${candidate.type}`)

    const contentResult = definition.schema.safeParse(candidate.content)
    if (!contentResult.success) {
      return invalid(`Invalid content for block ${candidate.id}.`)
    }

    ids.add(candidate.id)
    blocks.push({
      id: candidate.id,
      type: definition.name,
      parentId: candidate.parentId,
      content: contentResult.data,
    })
  }

  for (const block of blocks) {
    if (block.parentId === block.id) return invalid(`Block ${block.id} cannot parent itself.`)
    if (block.parentId !== null && !ids.has(block.parentId)) {
      return invalid(`Block ${block.id} references a missing parent.`)
    }

    const parent = blocks.find((candidate) => candidate.id === block.parentId)
    if (parent && !blockRegistry.allowsChild(parent.type, block.type)) {
      return invalid(`${block.type} is not allowed inside ${parent.type}.`)
    }

    const ancestors = new Set([block.id])
    let ancestor = parent
    while (ancestor) {
      if (ancestors.has(ancestor.id)) return invalid("Block response contains a cycle.")
      ancestors.add(ancestor.id)
      ancestor = blocks.find((candidate) => candidate.id === ancestor?.parentId)
    }
  }

  return { success: true, data: blocks }
}

function findSimilarBlockName(
  name: string,
  blockRegistry: BlockRegistry
): string | undefined {
  const normalizedName = name.toLowerCase()
  return blockRegistry.definitions.find((definition) =>
    definition.name.toLowerCase().includes(normalizedName)
  )?.name
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function invalid(message: string): ValidationResult<never> {
  return { success: false, message }
}
