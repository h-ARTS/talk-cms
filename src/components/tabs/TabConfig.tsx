import React from "react"
import { usePageBuilderStore } from "@/store/index"
import { Input } from "@/ui/input"
import { Label } from "@/ui/label"

const TabConfig: React.FC = () => {
  const pageName = usePageBuilderStore((state) => state.pageName)
  const setPageName = usePageBuilderStore((state) => state.setPageName)

  return (
    <div className="grid gap-4 p-4">
      <div>
        <h2 className="font-display text-sm font-semibold">Page configuration</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Manage metadata used when this page is saved and published.
        </p>
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="page-name">Name</Label>
        <Input
          id="page-name"
          value={pageName}
          onChange={(event) => setPageName(event.target.value)}
          placeholder="home"
          data-testid="page-name-input"
        />
        <p className="text-xs text-muted-foreground">
          A human-readable name used to create the public page slug.
        </p>
      </div>
    </div>
  )
}

export default TabConfig
