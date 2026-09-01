import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon, XIcon } from "lucide-react"

import { cn } from "@/ui/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-3.5 [&>svg]:size-4 [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        default: "border-border bg-card text-card-foreground [&>svg]:text-foreground",
        destructive:
          "border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive",
        success:
          "border-success/50 bg-success/10 text-foreground [&>svg]:text-success",
        info: "border-border bg-accent/50 text-foreground [&>svg]:text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const alertIcons = {
  default: InfoIcon,
  info: InfoIcon,
  destructive: AlertCircleIcon,
  success: CheckCircle2Icon,
} as const

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  onClose?: () => void
}

function Alert({ className, variant = "default", onClose, children, ...props }: AlertProps) {
  const Icon = alertIcons[variant ?? "default"]
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden />
      {children}
      {onClose && (
        <button
          type="button"
          aria-label="Dismiss"
          onClick={onClose}
          className="absolute right-2 top-2 cursor-pointer rounded-md p-1 opacity-70 transition-opacity duration-150 hover:opacity-100 focus:outline-2 focus:outline-ring"
        >
          <XIcon className="size-4" />
        </button>
      )}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5 className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
  )
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
  )
}

export { Alert, AlertTitle, AlertDescription }
