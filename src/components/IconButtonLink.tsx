import { forwardRef } from "react"
import { createLink, type LinkComponent } from "@tanstack/react-router"
import { IconButton, type IconButtonProps } from "@mui/material"

type IconButtonLinkProps = IconButtonProps<"a">

const IconButtonLinkComponent = forwardRef<HTMLAnchorElement, IconButtonLinkProps>(
  (props, ref) => <IconButton ref={ref} component="a" {...props} />
)

const CreatedIconButtonLink = createLink(IconButtonLinkComponent)

const IconButtonLink: LinkComponent<typeof IconButtonLinkComponent> = (props) => (
  <CreatedIconButtonLink preload="intent" {...props} />
)

export default IconButtonLink
