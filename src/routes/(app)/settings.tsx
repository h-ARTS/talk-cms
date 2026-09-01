import { useEffect, useState, type FormEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ExternalLinkIcon, MonitorCogIcon, MoonIcon, SunIcon } from "lucide-react"

import DashboardShell from "@/components/DashboardShell"
import { useThemeStore } from "@/store/index"
import type { ThemeMode } from "@/settings/core/account-settings"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Spinner,
  Switch,
} from "@/ui/index"

export const Route = createFileRoute("/(app)/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  const persistedMode = useThemeStore((state) => state.mode)
  const persistedUrl = useThemeStore((state) => state.visualComposerUrl)
  const settingsLoaded = useThemeStore((state) => state.settingsLoaded)
  const loadSettings = useThemeStore((state) => state.loadSettings)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void loadSettings().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : "The settings could not be loaded.")
    })
  }, [loadSettings])

  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Personalize Talk CMS and connect the site your content team edits in the visual composer.
        </p>

        {error ? (
          <Alert variant="destructive" className="mt-10">
            <AlertTitle>Settings unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : !settingsLoaded ? (
          <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground" role="status">
            <Spinner size={18} />
            Loading settings…
          </div>
        ) : (
          <SettingsForm initialMode={persistedMode} initialVisualComposerUrl={persistedUrl ?? ""} />
        )}
      </div>
    </DashboardShell>
  )
}

function SettingsForm({
  initialMode,
  initialVisualComposerUrl,
}: {
  initialMode: ThemeMode
  initialVisualComposerUrl: string
}) {
  const saveSettings = useThemeStore((state) => state.saveSettings)
  const [mode, setMode] = useState<ThemeMode>(initialMode)
  const [visualComposerUrl, setVisualComposerUrl] = useState(initialVisualComposerUrl)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await saveSettings(mode, visualComposerUrl)
      setMessage("Settings saved. Your workspace and visual composer are up to date.")
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The settings could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="mt-10 grid gap-6" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Settings unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert variant="success" aria-live="polite">
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
              <CardHeader className="border-b border-border">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {mode === "dark" ? <MoonIcon className="size-5" /> : <SunIcon className="size-5" />}
                  </span>
                  <div>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription className="mt-1">
                      Choose how the content workspace appears on this account.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center justify-between gap-6 rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <Label htmlFor="settings-dark-mode" className="cursor-pointer text-sm font-medium">
                      Dark mode
                    </Label>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use the darker color palette throughout Talk CMS.
                    </p>
                  </div>
                  <Switch
                    id="settings-dark-mode"
                    checked={mode === "dark"}
                    onCheckedChange={(checked) => setMode(checked ? "dark" : "light")}
                    aria-label="Use dark mode"
                  />
                </div>
              </CardContent>
      </Card>

      <Card>
              <CardHeader className="border-b border-border">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MonitorCogIcon className="size-5" />
                  </span>
                  <div>
                    <CardTitle>Visual composer</CardTitle>
                    <CardDescription className="mt-1">
                      Connect the end-user website or web app that renders content from Talk CMS.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <div className="grid max-w-2xl gap-2">
                  <Label htmlFor="visual-composer-url">Preview site URL</Label>
                  <Input
                    id="visual-composer-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://your-preview-site.example?editMode=true"
                    value={visualComposerUrl}
                    onChange={(event) => setVisualComposerUrl(event.target.value)}
                    maxLength={2_048}
                    aria-describedby="visual-composer-url-help"
                  />
                  <p id="visual-composer-url-help" className="text-sm text-muted-foreground">
                    Talk CMS opens this address inside the page builder and sends live block updates to its origin.
                  </p>
                  {isHttpUrl(visualComposerUrl) && (
                    <a
                      href={visualComposerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                    >
                      Test preview site
                      <ExternalLinkIcon className="size-4" aria-hidden />
                    </a>
                  )}
                </div>
              </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  )
}

function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) return false
  const protocol = new URL(value).protocol
  return protocol === "http:" || protocol === "https:"
}
