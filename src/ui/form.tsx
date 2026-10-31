import * as React from "react"

import { Label } from "@/ui/label"
import { cn } from "@/ui/lib/utils"

function Form({ className, ...props }: React.ComponentPropsWithoutRef<"form">) {
  return <form className={cn("grid gap-8", className)} {...props} />
}

type FormSectionProps = {
  children: React.ReactNode
  className?: string
  description?: React.ReactNode
  title: React.ReactNode
}

function FormSection({ children, className, description, title }: FormSectionProps) {
  const titleId = React.useId()

  return (
    <section aria-labelledby={titleId} className={cn("min-w-0", className)}>
      <div className="min-w-0 pb-6">
        <h2 id={titleId} className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

type FormSubsectionProps = {
  children: React.ReactNode
  className?: string
  controlsClassName?: string
  title: React.ReactNode
} & (
  | {
      description?: React.ReactNode
      htmlFor?: never
    }
  | {
      description?: never
      htmlFor: string
    }
)

function FormSubsection({
  children,
  className,
  controlsClassName = "flex items-start justify-between gap-6",
  description,
  htmlFor,
  title,
}: FormSubsectionProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 gap-6 border-b border-border py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-12",
        className
      )}
    >
      {htmlFor ? (
        <Label htmlFor={htmlFor} className="self-start text-lg font-semibold">
          {title}
        </Label>
      ) : (
        <div className="min-w-0">
          <h3 className="text-lg font-semibold">{title}</h3>
          {description ? (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
      )}
      <div className={cn("min-w-0", controlsClassName)}>{children}</div>
    </div>
  )
}

export { Form, FormSection, FormSubsection }
