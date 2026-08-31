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

export interface PageLister {
  list(): Promise<Page[]>
}

export interface PageUpdater {
  update(id: string, blocks: Block[]): Promise<boolean>
}

export interface PageDeleter {
  delete(id: string): Promise<boolean>
}
