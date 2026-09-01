import { MongoClient, type Collection } from "mongodb"
import {
  defaultAccountSettings,
  normalizeAccountSettingsInput,
  type AccountSettings,
  type AccountSettingsInput,
  type AccountSettingsRepository,
  type ThemeMode,
} from "../core/account-settings"
import { resolveMongoDbUri } from "@/pages/server/mongodb-page-repository"

type UserAccountDocument = {
  email: string
  name: string
  password: string
  settings?: {
    themeMode?: ThemeMode
    visualComposerUrl?: string | null
    updatedAt?: Date
  }
}

export class MongoDbAccountSettingsRepository implements AccountSettingsRepository {
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

  async findByEmail(email: string): Promise<AccountSettings | null> {
    const collection = await this.getCollection()
    const document = await collection.findOne(
      { email },
      { projection: { password: 0, name: 0, email: 0 } }
    )
    if (!document) return null

    return toAccountSettings(document.settings)
  }

  async updateByEmail(
    email: string,
    input: AccountSettingsInput
  ): Promise<AccountSettings | null> {
    const settings = normalizeAccountSettingsInput(input)
    const updatedAt = new Date()
    const collection = await this.getCollection()
    const document = await collection.findOneAndUpdate(
      { email },
      {
        $set: {
          "settings.themeMode": settings.themeMode,
          "settings.visualComposerUrl": settings.visualComposerUrl || null,
          "settings.updatedAt": updatedAt,
        },
      },
      {
        returnDocument: "after",
        projection: { password: 0, name: 0, email: 0 },
      }
    )
    if (!document) return null

    return toAccountSettings(document.settings)
  }

  async updateThemeByEmail(
    email: string,
    themeMode: ThemeMode
  ): Promise<ThemeMode | null> {
    const collection = await this.getCollection()
    const document = await collection.findOneAndUpdate(
      { email },
      {
        $set: {
          "settings.themeMode": themeMode,
          "settings.updatedAt": new Date(),
        },
      },
      {
        returnDocument: "after",
        projection: { _id: 0, "settings.themeMode": 1 },
      }
    )
    return document?.settings?.themeMode ?? null
  }

  async close(): Promise<void> {
    await this.client.close()
    this.connection = undefined
  }

  private async getCollection(): Promise<Collection<UserAccountDocument>> {
    const client = await this.getClient()
    return client.db(this.databaseName).collection<UserAccountDocument>("user-accounts")
  }

  private getClient(): Promise<MongoClient> {
    this.connection ??= this.client.connect().catch((error: unknown) => {
      this.connection = undefined
      throw error
    })
    return this.connection
  }
}

function toAccountSettings(
  settings: UserAccountDocument["settings"]
): AccountSettings {
  return {
    themeMode: settings?.themeMode ?? defaultAccountSettings.themeMode,
    visualComposerUrl:
      settings?.visualComposerUrl ?? defaultAccountSettings.visualComposerUrl,
    updatedAt: settings?.updatedAt ?? defaultAccountSettings.updatedAt,
  }
}

let configuredRepository: MongoDbAccountSettingsRepository | undefined

export function getAccountSettingsRepository(): AccountSettingsRepository {
  if (configuredRepository) return configuredRepository

  const databaseName = process.env.MONGODB_DATABASE?.trim() || "talk_cms"
  configuredRepository = new MongoDbAccountSettingsRepository(
    resolveMongoDbUri(),
    databaseName
  )
  return configuredRepository
}

export function resolveAccountEmail(
  configuredEmail = process.env.TALK_CMS_ACCOUNT_EMAIL,
  nodeEnvironment = process.env.NODE_ENV
): string {
  const email = configuredEmail?.trim().toLowerCase()
  if (email) return email
  if (nodeEnvironment !== "production") return "admin@talk.local"
  throw new Error("TALK_CMS_ACCOUNT_EMAIL is not configured")
}
