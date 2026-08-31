import { forwardRef } from "react"
import { createLink, type LinkComponent } from "@tanstack/react-router"
import { ListItemButton, type ListItemButtonProps } from "@mui/material"

type DashboardNavigationLinkProps = ListItemButtonProps<"a">

const DashboardNavigationLinkComponent = forwardRef<
  HTMLAnchorElement,
  DashboardNavigationLinkProps
>((props, ref) => <ListItemButton ref={ref} component="a" {...props} />)

const CreatedDashboardNavigationLink = createLink(DashboardNavigationLinkComponent)

const DashboardNavigationLink: LinkComponent<
  typeof DashboardNavigationLinkComponent
> = (props) => <CreatedDashboardNavigationLink preload="intent" {...props} />

export default DashboardNavigationLink
