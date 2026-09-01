import { z } from "zod"

export const themeModeSchema = z.enum(["light", "dark"])
export type ThemeMode = z.infer<typeof themeModeSchema>

const visualComposerUrlSchema = z
  .string()
  .trim()
  .max(2_048, "The visual composer URL must be 2,048 characters or fewer.")
  .refine(
    (value) => value === "" || isHttpUrl(value),
    "Enter a valid URL beginning with http:// or https://."
  )

export const accountSettingsInputSchema = z.object({
  themeMode: themeModeSchema,
  visualComposerUrl: visualComposerUrlSchema,
})

export const accountThemeInputSchema = z.object({
  themeMode: themeModeSchema,
})

export type AccountSettingsInput = z.infer<typeof accountSettingsInputSchema>

export type AccountSettings = {
  themeMode: ThemeMode
  visualComposerUrl: string | null
  updatedAt: Date | null
}

export interface AccountSettingsRepository {
  findByEmail(email: string): Promise<AccountSettings | null>
  updateByEmail(email: string, settings: AccountSettingsInput): Promise<AccountSettings | null>
  updateThemeByEmail(email: string, themeMode: ThemeMode): Promise<ThemeMode | null>
}

export const defaultAccountSettings: AccountSettings = {
  themeMode: "dark",
  visualComposerUrl: null,
  updatedAt: null,
}

export function normalizeAccountSettingsInput(
  input: AccountSettingsInput
): AccountSettingsInput {
  return {
    themeMode: input.themeMode,
    visualComposerUrl: input.visualComposerUrl.trim(),
  }
}

function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) return false
  const protocol = new URL(value).protocol
  return protocol === "http:" || protocol === "https:"
}
