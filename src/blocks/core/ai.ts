import type { BlockInput } from "./definition"
import type { BlockRegistry } from "./registry"

export function createBlockCatalog(blockRegistry: BlockRegistry) {
  return blockRegistry.definitions
    .map((definition) => {
      const inputs = Object.entries(definition.inputs)
        .map(([name, input]) => `${name} (${describeInput(input)})`)
        .join(", ")
      const children = describeChildren(definition.allowedChildren)

      return `- ${definition.name}: ${definition.metadata.description ?? definition.metadata.label}. Content fields: ${inputs || "none"}. Children: ${children}.`
    })
    .join("\n")
}

function describeInput(input: BlockInput) {
  if (input.type !== "number") return input.type

  const constraints = [
    input.min === undefined ? undefined : `minimum ${input.min}`,
    input.max === undefined ? undefined : `maximum ${input.max}`,
  ].filter(Boolean)

  return constraints.length ? `number, ${constraints.join(", ")}` : "number"
}

function describeChildren(policy: boolean | readonly string[] | undefined) {
  if (policy === true) return "any registered block"
  if (Array.isArray(policy)) return policy.length ? policy.join(", ") : "none"
  return "none"
}
