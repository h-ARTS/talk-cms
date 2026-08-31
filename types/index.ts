export type ActiveBlock = {
  id: string
  type: string
}

export type Block = {
  id: string
  type: string
  parentId: string | null
  content: Record<string, unknown>
  children?: Block[]
}
