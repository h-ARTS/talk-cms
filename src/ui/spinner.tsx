import { Loader2Icon } from "lucide-react"

import { cn } from "@/ui/lib/utils"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
}

function Spinner({ className, size = 24, ...props }: SpinnerProps) {
  return (
    <div role="status" aria-label="Loading" className={cn("inline-flex", className)} {...props}>
      <Loader2Icon className="animate-spin text-muted-foreground" style={{ width: size, height: size }} />
    </div>
  )
}

export { Spinner }
