import type { ReactElement, ReactNode } from "react"

import { cn } from "@/ui/lib/utils"

type PageHeaderProps = {
  action?: ReactElement
  className?: string
  title: ReactNode
}

function PageHeader({ action, className, title }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 border-b border-border pb-8",
        className
      )}
    >
      <h1 className="font-display text-4xl font-bold tracking-tight">{title}</h1>
      {action}
    </header>
  )
}

export { PageHeader }
