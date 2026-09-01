import { createFileRoute } from "@tanstack/react-router"
import {
  accountSettingsInputSchema,
  accountThemeInputSchema,
  type AccountSettingsRepository,
} from "@/settings/core/account-settings"
import {
  getAccountSettingsRepository,
  resolveAccountEmail,
} from "@/settings/server/mongodb-account-settings-repository"

type SettingsDependencies = {
  accountEmail: string
  repository: AccountSettingsRepository
}

export const Route = createFileRoute("/api/internal/settings")({
  server: {
    handlers: {
      GET: () => createSettingsGetHandler()(),
      PATCH: ({ request }) => createSettingsPatchHandler()(request),
      PUT: ({ request }) => createSettingsPutHandler()(request),
    },
  },
})

export function createSettingsGetHandler(dependencies?: SettingsDependencies) {
  return async (): Promise<Response> => {
    try {
      const { accountEmail, repository } = resolveDependencies(dependencies)
      const settings = await repository.findByEmail(accountEmail)
      if (!settings) return accountNotFoundResponse()
      return Response.json(settings)
    } catch (error) {
      console.error("Failed to load account settings:", error)
      return Response.json(
        { error: "The settings could not be loaded." },
        { status: 500 }
      )
    }
  }
}

export function createSettingsPatchHandler(dependencies?: SettingsDependencies) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await readRequestBody(request)
      if (!body.success) return body.response

      const parsed = accountThemeInputSchema.safeParse(body.value)
      if (!parsed.success) {
        return Response.json(
          { error: parsed.error.issues[0]?.message ?? "The theme setting is invalid." },
          { status: 400 }
        )
      }

      const { accountEmail, repository } = resolveDependencies(dependencies)
      const themeMode = await repository.updateThemeByEmail(
        accountEmail,
        parsed.data.themeMode
      )
      if (!themeMode) return accountNotFoundResponse()
      return Response.json({ themeMode })
    } catch (error) {
      console.error("Failed to update account theme:", error)
      return Response.json(
        { error: "The theme setting could not be saved." },
        { status: 500 }
      )
    }
  }
}

export function createSettingsPutHandler(dependencies?: SettingsDependencies) {
  return async (request: Request): Promise<Response> => {
    try {
      const body = await readRequestBody(request)
      if (!body.success) return body.response

      const parsed = accountSettingsInputSchema.safeParse(body.value)
      if (!parsed.success) {
        return Response.json(
          { error: parsed.error.issues[0]?.message ?? "The settings are invalid." },
          { status: 400 }
        )
      }

      const { accountEmail, repository } = resolveDependencies(dependencies)
      const settings = await repository.updateByEmail(accountEmail, parsed.data)
      if (!settings) return accountNotFoundResponse()
      return Response.json(settings)
    } catch (error) {
      console.error("Failed to update account settings:", error)
      return Response.json(
        { error: "The settings could not be saved." },
        { status: 500 }
      )
    }
  }
}

function resolveDependencies(
  dependencies?: SettingsDependencies
): SettingsDependencies {
  return {
    accountEmail: dependencies?.accountEmail ?? resolveAccountEmail(),
    repository: dependencies?.repository ?? getAccountSettingsRepository(),
  }
}

function accountNotFoundResponse(): Response {
  return Response.json(
    { error: "The configured user account could not be found." },
    { status: 404 }
  )
}

async function readRequestBody(
  request: Request
): Promise<{ success: true; value: unknown } | { success: false; response: Response }> {
  try {
    return { success: true, value: await request.json() }
  } catch {
    return {
      success: false,
      response: Response.json(
        { error: "A valid JSON body is required." },
        { status: 400 }
      ),
    }
  }
}
