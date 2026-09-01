import { randomUUID } from "node:crypto"
import {
  normalizePageAlias,
  type CreatePageInput,
  type Page,
  type PageRepository,
} from "../core/page"

type PageCreationDependencies = {
  createId: () => string
  now: () => Date
}

const defaultDependencies: PageCreationDependencies = {
  createId: randomUUID,
  now: () => new Date(),
}

export async function createPage(
  input: CreatePageInput,
  repository: PageRepository,
  dependencies: PageCreationDependencies = defaultDependencies
): Promise<Page> {
  const page: Page = {
    id: dependencies.createId(),
    alias: normalizePageAlias(input.alias),
    blocks: input.blocks,
    createdAt: dependencies.now(),
  }

  await repository.create(page)
  return page
}
