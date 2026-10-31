import { useEffect, useState, type FormEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ExternalLinkIcon } from "lucide-react"

import DashboardShell from "@/components/DashboardShell"
import { useThemeStore } from "@/store/index"
import type { ThemeMode } from "@/settings/core/account-settings"
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
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
            setError(
                cause instanceof Error
                    ? cause.message
                    : "The settings could not be loaded.",
            )
        })
    }, [loadSettings])

    return (
        <DashboardShell>
            <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
                {(error || !settingsLoaded) && (
                    <h1 className="font-display text-4xl font-bold tracking-tight">
                        Settings
                    </h1>
                )}

                {error ? (
                    <Alert variant="destructive" className="mt-10">
                        <AlertTitle>Settings unavailable</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : !settingsLoaded ? (
                    <div
                        className="mt-10 flex items-center gap-3 text-sm text-muted-foreground"
                        role="status"
                    >
                        <Spinner size={18} />
                        Loading settings…
                    </div>
                ) : (
                    <SettingsForm
                        initialMode={persistedMode}
                        initialVisualComposerUrl={persistedUrl ?? ""}
                    />
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
    const [visualComposerUrl, setVisualComposerUrl] = useState(
        initialVisualComposerUrl,
    )
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
            setMessage(
                "Settings saved. Your workspace and visual composer are up to date.",
            )
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "The settings could not be saved.",
            )
        } finally {
            setSaving(false)
        }
    }

    return (
        <form className="grid gap-8" onSubmit={handleSubmit}>
            <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8">
                <h1 className="font-display text-4xl font-bold tracking-tight">
                    Settings
                </h1>
                <Button type="submit" size="lg" disabled={saving}>
                    {saving ? "Saving…" : "Save settings"}
                </Button>
            </header>
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

            <section
                aria-labelledby="workspace-settings-title"
                className="min-w-0"
            >
                <div className="min-w-0 pb-6">
                    <h2
                        id="workspace-settings-title"
                        className="font-display text-2xl font-semibold tracking-tight"
                    >
                        Workspace settings
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Personalize Talk CMS for this account.
                    </p>
                </div>
                <div className="grid min-w-0 gap-6 border-b border-border py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
                    <div className="min-w-0">
                        <h3 className="text-lg font-semibold">Appearance</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Choose how the content workspace appears on this
                            account.
                        </p>
                    </div>
                    <div className="flex min-w-0 items-start justify-between gap-6">
                        <div className="min-w-0">
                            <Label
                                htmlFor="settings-dark-mode"
                                className="cursor-pointer text-sm font-medium"
                            >
                                Dark mode
                            </Label>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Use the darker color palette throughout Talk
                                CMS.
                            </p>
                        </div>
                        <Switch
                            id="settings-dark-mode"
                            className="mt-0.5 shrink-0"
                            checked={mode === "dark"}
                            onCheckedChange={(checked) =>
                                setMode(checked ? "dark" : "light")
                            }
                            aria-label="Use dark mode"
                        />
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="visual-composer-title"
                className="min-w-0"
            >
                <div className="min-w-0 pb-6">
                    <h2
                        id="visual-composer-title"
                        className="font-display text-2xl font-semibold tracking-tight"
                    >
                        Visual Composer
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Connect the end-user website or web app that renders
                        content from Talk CMS.
                    </p>
                </div>
                <div className="grid min-w-0 gap-6 border-b border-border py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12">
                    <Label
                        htmlFor="visual-composer-url"
                        className="self-start text-lg font-semibold"
                    >
                        Preview site URL
                    </Label>
                    <div className="grid min-w-0 gap-2">
                        <Input
                            id="visual-composer-url"
                            type="url"
                            inputMode="url"
                            placeholder="https://your-preview-site.example?editMode=true"
                            value={visualComposerUrl}
                            onChange={(event) =>
                                setVisualComposerUrl(event.target.value)
                            }
                            maxLength={2_048}
                            aria-describedby="visual-composer-url-help"
                        />
                        <p
                            id="visual-composer-url-help"
                            className="text-sm text-muted-foreground"
                        >
                            Talk CMS opens this address inside the page builder
                            and sends live block updates to its origin.
                        </p>
                        {isHttpUrl(visualComposerUrl) && (
                            <a
                                href={visualComposerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-2 inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
                            >
                                Test preview site
                                <ExternalLinkIcon
                                    className="size-4"
                                    aria-hidden
                                />
                            </a>
                        )}
                    </div>
                </div>
            </section>
        </form>
    )
}

function isHttpUrl(value: string): boolean {
    if (!URL.canParse(value)) return false
    const protocol = new URL(value).protocol
    return protocol === "http:" || protocol === "https:"
}
