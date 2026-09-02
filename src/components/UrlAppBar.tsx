import React from "react"

const UrlAppBar: React.FC<{ url: string }> = ({ url }) => {
  return (
    <div className="flex h-12 items-center border-b border-border bg-secondary px-3">
      <div className="w-full rounded-full bg-card px-4 py-1.5 shadow-sm ring-1 ring-border/70">
        <span className="select-none text-sm text-muted-foreground">{url}</span>
      </div>
    </div>
  )
}

export default UrlAppBar
