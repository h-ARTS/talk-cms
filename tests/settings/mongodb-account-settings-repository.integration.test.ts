import { randomUUID } from "node:crypto"
import { MongoClient } from "mongodb"
import { MongoDbAccountSettingsRepository } from "@/settings/server/mongodb-account-settings-repository"
import { resolveMongoDbUri } from "@/pages/server/mongodb-page-repository"

const runIntegrationTests = process.env.MONGODB_INTEGRATION_TEST === "true"
const describeWithMongo = runIntegrationTests ? describe : describe.skip
const databaseName = process.env.MONGODB_DATABASE || "talk_cms"
const uri = resolveMongoDbUri()

describeWithMongo("MongoDbAccountSettingsRepository", () => {
  const repository = new MongoDbAccountSettingsRepository(uri, databaseName)
  const verificationClient = new MongoClient(uri)
  const testId = randomUUID()
  const ownerEmail = `settings-owner-${testId}@example.com`
  const legacyEmail = `settings-legacy-${testId}@example.com`

  beforeAll(async () => {
    await verificationClient.connect()
  })

  afterAll(async () => {
    await verificationClient
      .db(databaseName)
      .collection("user-accounts")
      .deleteMany({ email: { $in: [ownerEmail, legacyEmail] } })
    await repository.close()
    await verificationClient.close()
  })

  test("updates nested settings without exposing or replacing account credentials", async () => {
    const collection = verificationClient.db(databaseName).collection("user-accounts")
    await collection.insertOne({
      email: ownerEmail,
      name: "Site owner",
      password: "hashed-secret",
      settings: { editorDensity: "compact" },
    })

    const settings = await repository.updateByEmail(ownerEmail, {
      themeMode: "light",
      visualComposerUrl: "https://preview.example.com?editMode=true",
    })
    const account = await collection.findOne({ email: ownerEmail })

    expect(settings).toMatchObject({
      themeMode: "light",
      visualComposerUrl: "https://preview.example.com?editMode=true",
    })
    expect(account).toMatchObject({
      email: ownerEmail,
      name: "Site owner",
      password: "hashed-secret",
      settings: {
        themeMode: "light",
        visualComposerUrl: "https://preview.example.com?editMode=true",
        editorDensity: "compact",
      },
    })

    await expect(repository.updateThemeByEmail(ownerEmail, "dark")).resolves.toBe("dark")
    await expect(collection.findOne({ email: ownerEmail })).resolves.toMatchObject({
      settings: {
        themeMode: "dark",
        visualComposerUrl: "https://preview.example.com?editMode=true",
        editorDensity: "compact",
      },
    })
  })

  test("returns defaults for an existing legacy account", async () => {
    const collection = verificationClient.db(databaseName).collection("user-accounts")
    await collection.insertOne({
      email: legacyEmail,
      name: "Legacy owner",
      password: "hashed-secret",
    })

    await expect(repository.findByEmail(legacyEmail)).resolves.toEqual({
      themeMode: "dark",
      visualComposerUrl: null,
      updatedAt: null,
    })
  })

  test("does not create an account when the configured email is missing", async () => {
    await expect(
      repository.updateByEmail("missing@example.com", {
        themeMode: "dark",
        visualComposerUrl: "",
      })
    ).resolves.toBeNull()
  })
})
