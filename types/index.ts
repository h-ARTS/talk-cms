export type ActiveBlock = {
  id: string
  type: BlockType
}

export interface Block {
  id: string
  type: BlockType
  parentId: string | null
  content: { [key: string]: any }
  children?: Block[]
}

export enum BlockType {
  Headline = "Headline",
  Grid = "Grid",
  Teaser = "Teaser",
  Card = "Card",
  Carousel = "Carousel",
}
