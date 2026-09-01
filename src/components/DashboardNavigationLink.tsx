import { forwardRef, type AnchorHTMLAttributes } from "react"
import { createLink, type LinkComponent } from "@tanstack/react-router"

import { cn } from "@/ui/lib/utils"

type DashboardNavigationLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  active?: boolean
}

const DashboardNavigationLinkComponent = forwardRef<
  HTMLAnchorElement,
  DashboardNavigationLinkProps
>(({ className, active, ...props }, ref) => (
  <a
    ref={ref}
    className={cn(
      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-ring",
      active
        ? "bg-accent text-accent-foreground"
        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      className
    )}
    {...props}
  />
))
DashboardNavigationLinkComponent.displayName = "DashboardNavigationLink"

const CreatedDashboardNavigationLink = createLink(DashboardNavigationLinkComponent)

const DashboardNavigationLink: LinkComponent<
  typeof DashboardNavigationLinkComponent
> = (props) => <CreatedDashboardNavigationLink preload="intent" {...props} />

export default DashboardNavigationLink
