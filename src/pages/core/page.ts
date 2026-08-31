import type { Block } from "@/types/index"

export type Page = {
  id: string
  blocks: Block[]
  createdAt: Date
}

export type CreatePageInput = {
  blocks: Block[]
}

export interface PageRepository {
  create(page: Page): Promise<void>
}

export interface PageReader {
  findById(id: string): Promise<Page | null>
}
