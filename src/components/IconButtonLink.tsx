import { forwardRef } from "react"
import { createLink, type LinkComponent } from "@tanstack/react-router"

import { cn } from "@/ui/lib/utils"

type IconButtonLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>

const IconButtonLinkComponent = forwardRef<HTMLAnchorElement, IconButtonLinkProps>(
  ({ className, ...props }, ref) => (
    <a
      ref={ref}
      className={cn(
        "inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
)
IconButtonLinkComponent.displayName = "IconButtonLink"

const CreatedIconButtonLink = createLink(IconButtonLinkComponent)

const IconButtonLink: LinkComponent<typeof IconButtonLinkComponent> = (props) => (
  <CreatedIconButtonLink preload="intent" {...props} />
)

export default IconButtonLink
