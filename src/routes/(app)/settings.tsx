import { useEffect, useId, useState, type FormEvent } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { ExternalLinkIcon } from "lucide-react"

import DashboardShell from "@/components/DashboardShell"
import PageLayout from "@/components/PageLayout"
import { useThemeStore } from "@/store/index"
import type { ThemeMode } from "@/settings/core/account-settings"
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    Form,
    FormSection,
    FormSubsection,
    Input,
    Label,
    PageHeader,
    Spinner,
    Switch,
} from "@/ui/index"

export const Route = createFileRoute("/(app)/settings")({
    component: SettingsPage,
})

function SettingsPage() {
    const formId = useId()
    const persistedMode = useThemeStore((state) => state.mode)
    const persistedUrl = useThemeStore((state) => state.visualComposerUrl)
    const settingsLoaded = useThemeStore((state) => state.settingsLoaded)
    const loadSettings = useThemeStore((state) => state.loadSettings)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

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
            <PageLayout>
                <PageHeader
                    title="Settings"
                    action={
                        !error && settingsLoaded ? (
                            <Button
                                type="submit"
                                form={formId}
                                size="lg"
                                disabled={saving}
                            >
                                {saving ? "Saving…" : "Save settings"}
                            </Button>
                        ) : undefined
                    }
                />

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
                        formId={formId}
                        initialMode={persistedMode}
                        initialVisualComposerUrl={persistedUrl ?? ""}
                        onSavingChange={setSaving}
                    />
                )}
            </PageLayout>
        </DashboardShell>
    )
}

function SettingsForm({
    formId,
    initialMode,
    initialVisualComposerUrl,
    onSavingChange,
}: {
    formId: string
    initialMode: ThemeMode
    initialVisualComposerUrl: string
    onSavingChange: (saving: boolean) => void
}) {
    const saveSettings = useThemeStore((state) => state.saveSettings)
    const [mode, setMode] = useState<ThemeMode>(initialMode)
    const [visualComposerUrl, setVisualComposerUrl] = useState(
        initialVisualComposerUrl,
    )
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        onSavingChange(true)
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
            onSavingChange(false)
        }
    }

    return (
        <Form id={formId} className="mt-8" onSubmit={handleSubmit}>
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

            <FormSection
                title="Workspace settings"
                description="Personalize Talk CMS for this account."
            >
                <FormSubsection
                    title="Appearance"
                    description="Choose how the content workspace appears on this account."
                >
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
                </FormSubsection>
            </FormSection>

            <FormSection
                title="Visual Composer"
                description="Connect the end-user website or web app that renders content from Talk CMS."
            >
                <FormSubsection
                    title="Preview site URL"
                    htmlFor="visual-composer-url"
                    controlsClassName="grid gap-2"
                >
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
                </FormSubsection>
            </FormSection>
        </Form>
    )
}

function isHttpUrl(value: string): boolean {
    if (!URL.canParse(value)) return false
    const protocol = new URL(value).protocol
    return protocol === "http:" || protocol === "https:"
}
