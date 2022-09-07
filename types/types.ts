export interface Block {
  id: string
  type: BlockType
  parentId: string | null
  content: string
}

export enum BlockType {
  Headline = "Headline",
  Grid = "Grid",
  Teaser = "Teaser",
  Card = "Card",
  Carousel = "Carousel",
}
