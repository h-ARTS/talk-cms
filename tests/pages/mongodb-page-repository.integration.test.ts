import { randomUUID } from "node:crypto"
import { MongoClient } from "mongodb"
import type { Page } from "@/pages/core/page"
import { MongoDbPageRepository } from "@/pages/server/mongodb-page-repository"
import { resolveMongoDbUri } from "@/pages/server/mongodb-page-repository"

const runIntegrationTests = process.env.MONGODB_INTEGRATION_TEST === "true"
const describeWithMongo = runIntegrationTests ? describe : describe.skip

describe("MongoDB configuration", () => {
  test("uses the local Compose database during development", () => {
    expect(resolveMongoDbUri(undefined, "development")).toContain(
      "localhost:27017/talk_cms"
    )
  })

  test("requires an explicit database URI in production", () => {
    expect(() => resolveMongoDbUri(undefined, "production")).toThrow(
      "MONGODB_URI is not configured"
    )
  })
})

describeWithMongo("MongoDbPageRepository", () => {
  test("inserts and reads a page from the pages collection", async () => {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error("MONGODB_URI is required for MongoDB integration tests")

    const databaseName = process.env.MONGODB_DATABASE || "talk_cms"
    const repository = new MongoDbPageRepository(uri, databaseName)
    const verificationClient = new MongoClient(uri)
    const page: Page = {
      id: `page-${randomUUID()}`,
      blocks: [
        {
          id: "hero-1",
          type: "Hero",
          parentId: null,
          content: { title: "Product" },
        },
      ],
      createdAt: new Date("2026-08-31T10:00:00.000Z"),
    }

    try {
      await repository.create(page)
      await expect(repository.findById(page.id)).resolves.toEqual(page)
      await expect(repository.findById(`missing-${page.id}`)).resolves.toBeNull()

      await verificationClient.connect()
      const storedPage = await verificationClient
        .db(databaseName)
        .collection<{ _id: string }>("pages")
        .findOne({ _id: page.id })

      expect(storedPage).toMatchObject({
        _id: page.id,
        blocks: page.blocks,
        createdAt: page.createdAt,
      })
    } finally {
      await verificationClient
        .db(databaseName)
        .collection<{ _id: string }>("pages")
        .deleteOne({ _id: page.id })
      await Promise.all([repository.close(), verificationClient.close()])
    }
  })
})
