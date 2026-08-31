import { MongoClient, type Collection } from "mongodb"
import type {
  Page,
  PageDeleter,
  PageLister,
  PageReader,
  PageRepository,
  PageUpdater,
} from "../core/page"

const localMongoDbUri =
  "mongodb://talk-app:talk-app-local-only@localhost:27017/talk_cms?authSource=talk_cms"

type PageDocument = Omit<Page, "id"> & {
  _id: string
}

export class MongoDbPageRepository
  implements PageRepository, PageReader, PageLister, PageUpdater, PageDeleter
{
  private readonly client: MongoClient
  private connection?: Promise<MongoClient>

  constructor(
    uri: string,
    private readonly databaseName: string
  ) {
    this.client = new MongoClient(uri, {
      connectTimeoutMS: 5_000,
      serverSelectionTimeoutMS: 5_000,
      socketTimeoutMS: 10_000,
      waitQueueTimeoutMS: 5_000,
      maxPoolSize: 20,
    })
  }

  async create(page: Page): Promise<void> {
    const collection = await this.getCollection()
    const result = await collection.insertOne({
      _id: page.id,
      blocks: page.blocks,
      createdAt: page.createdAt,
    })
    if (!result.acknowledged) {
      throw new Error("MongoDB did not acknowledge the page insert")
    }
  }

  async findById(id: string): Promise<Page | null> {
    const collection = await this.getCollection()
    const document = await collection.findOne({ _id: id })
    if (!document) return null

    return {
      id: document._id,
      blocks: document.blocks,
      createdAt: document.createdAt,
    }
  }

  async list(): Promise<Page[]> {
    const collection = await this.getCollection()
    const documents = await collection.find().sort({ createdAt: -1, _id: -1 }).toArray()

    return documents.map((document) => ({
      id: document._id,
      blocks: document.blocks,
      createdAt: document.createdAt,
    }))
  }

  async update(id: string, blocks: Page["blocks"]): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.updateOne({ _id: id }, { $set: { blocks } })
    return result.matchedCount === 1
  }

  async delete(id: string): Promise<boolean> {
    const collection = await this.getCollection()
    const result = await collection.deleteOne({ _id: id })
    return result.deletedCount === 1
  }

  async close(): Promise<void> {
    await this.client.close()
    this.connection = undefined
  }

  private async getCollection(): Promise<Collection<PageDocument>> {
    const client = await this.getClient()
    return client.db(this.databaseName).collection<PageDocument>("pages")
  }

  private getClient(): Promise<MongoClient> {
    this.connection ??= this.client.connect().catch((error: unknown) => {
      this.connection = undefined
      throw error
    })
    return this.connection
  }
}

let configuredRepository: MongoDbPageRepository | undefined

export function getPageRepository(): PageRepository {
  return getConfiguredRepository()
}

export function getPageReader(): PageReader {
  return getConfiguredRepository()
}

export function getPageLister(): PageLister {
  return getConfiguredRepository()
}

export function getPageUpdater(): PageUpdater {
  return getConfiguredRepository()
}

export function getPageDeleter(): PageDeleter {
  return getConfiguredRepository()
}

function getConfiguredRepository(): MongoDbPageRepository {
  if (configuredRepository) return configuredRepository

  const uri = resolveMongoDbUri()

  const databaseName = process.env.MONGODB_DATABASE?.trim() || "talk_cms"
  configuredRepository = new MongoDbPageRepository(uri, databaseName)
  return configuredRepository
}

export function resolveMongoDbUri(
  configuredUri = process.env.MONGODB_URI,
  nodeEnvironment = process.env.NODE_ENV
): string {
  const uri = configuredUri?.trim()
  if (uri) return uri
  if (nodeEnvironment !== "production") return localMongoDbUri
  throw new Error("MONGODB_URI is not configured")
}
