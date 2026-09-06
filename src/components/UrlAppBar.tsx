import React from "react"
import { RefreshCwIcon } from "lucide-react"

import { Button } from "@/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui/tooltip"

const UrlAppBar: React.FC<{ url: string; onRefresh?: () => void }> = ({ url, onRefresh }) => {
  return (
    <div className="flex h-12 items-center gap-2 border-b border-border bg-secondary px-3">
      <div className="min-w-0 flex-1 rounded-full bg-card px-4 py-1.5 shadow-sm ring-1 ring-border/70">
        <span className="block select-none truncate text-sm text-muted-foreground">{url}</span>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:bg-card hover:text-card-foreground hover:shadow-sm"
            onClick={onRefresh}
            aria-label="Refresh preview"
          >
            <RefreshCwIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh preview</TooltipContent>
      </Tooltip>
    </div>
  )
}

export default UrlAppBar
