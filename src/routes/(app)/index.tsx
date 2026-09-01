import { createFileRoute, Link } from "@tanstack/react-router"
import { ArrowRightIcon, BlocksIcon, FileTextIcon } from "lucide-react"

import DashboardShell from "@/components/DashboardShell"
import { Card, CardDescription, CardTitle } from "@/ui/card"

export const Route = createFileRoute("/(app)/")({
  component: DashboardPage,
})

const destinations = [
  {
    to: "/content/pages",
    icon: FileTextIcon,
    title: "Pages",
    description: "Open saved content in the visual composer.",
  },
  {
    to: "/blocks",
    icon: BlocksIcon,
    title: "Block definitions",
    description: "Model the fields for your content blocks.",
  },
] as const

function DashboardPage() {
  return (
    <DashboardShell>
      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Workspace
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Choose Pages or Block definitions from the navigation to manage your content.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {destinations.map((dest) => {
            const Icon = dest.icon
            return (
              <Link key={dest.to} to={dest.to} className="group cursor-pointer">
                <Card className="flex h-full items-center gap-4 p-5 transition-colors duration-200 hover:border-primary/60 hover:bg-accent/40">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <CardTitle className="text-base">{dest.title}</CardTitle>
                    <CardDescription className="mt-1">{dest.description}</CardDescription>
                  </span>
                  <ArrowRightIcon
                    className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
