import type { Block } from "@/types/index"

export type Page = {
  id: string
  alias: string | null
  blocks: Block[]
  createdAt: Date
}

export type CreatePageInput = {
  blocks: Block[]
  alias?: string | null
}

export type UpdatePageInput = {
  blocks: Block[]
  alias?: string | null
}

export function normalizePageAlias(
  alias: string | null | undefined
): string | null {
  const normalized = alias?.trim()
  return normalized ? normalized : null
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
  update(id: string, page: UpdatePageInput): Promise<boolean>
}

export interface PageDeleter {
  delete(id: string): Promise<boolean>
}
