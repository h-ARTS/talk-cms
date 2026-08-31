import {
  createDefaultContent,
  type BlockDefinition,
} from "./definition"

export type BlockRegistry = ReturnType<typeof createBlockRegistry>

export function createBlockRegistry(definitions: readonly BlockDefinition[]) {
  const definitionsByName = new Map<string, BlockDefinition>()
  for (const definition of definitions) {
    definitionsByName.set(definition.name.toLowerCase(), definition)
  }

  return {
    definitions,
    get(name: string): BlockDefinition | undefined {
      return definitionsByName.get(name.toLowerCase())
    },
    createBlock(
      type: string,
      parentId: string | null,
      id: string
    ): {
      id: string
      type: string
      parentId: string | null
      content: Record<string, unknown>
    } {
      const definition = definitionsByName.get(type.toLowerCase())
      if (!definition) throw new Error(`Unknown block type: ${type}`)

      return {
        id,
        type: definition.name,
        parentId,
        content: createDefaultContent(definition),
      }
    },
    allowsChild(parentType: string, childType: string) {
      const definition = definitionsByName.get(parentType.toLowerCase())
      if (!definition) return false
      if (definition.allowedChildren === true) return Boolean(this.get(childType))
      if (!Array.isArray(definition.allowedChildren)) return false
      return definition.allowedChildren.some(
        (allowedType) => allowedType.toLowerCase() === childType.toLowerCase()
      )
    },
    getAllowedDefinitions(parentType?: string): readonly BlockDefinition[] {
      if (parentType === undefined) return definitions
      return definitions.filter((definition) =>
        this.allowsChild(parentType, definition.name)
      )
    },
  }
}
