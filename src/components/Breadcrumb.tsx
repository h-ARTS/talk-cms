import React from "react"
import { Breadcrumbs, Link, Typography } from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/src/store"
import { setNavigationHistory } from "@/src/store/pageBuilderSlice"

const Breadcrumb = () => {
  const dispatch = useDispatch()
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)
  const navigationHistory = useSelector(
    (state: RootState) => state.pageBuilder.navigationHistory
  )

  const handleBreadcrumbClick = (index: number) => {
    dispatch(setNavigationHistory(navigationHistory.slice(0, index + 1)))
  }

  return (
    <Breadcrumbs aria-label="breadcrumb" sx={{ marginY: 2, marginX: 3 }}>
      {navigationHistory.length === 0 ? (
        <Typography color="text.primary">Page</Typography>
      ) : (
        <Link
          component="button"
          underline="hover"
          variant="subtitle1"
          onClick={() => handleBreadcrumbClick(-1)}
        >
          Page
        </Link>
      )}
      {navigationHistory.map((id, index) => {
        const block = blocks.find((b) => b.id === id)
        const isLast = index === navigationHistory.length - 1
        return isLast ? (
          <Typography color="text.primary" variant="subtitle1" key={id}>
            {block?.type}
          </Typography>
        ) : (
          <Link
            component="button"
            underline="hover"
            variant="subtitle1"
            key={id}
            onClick={() => handleBreadcrumbClick(index)}
          >
            {block?.type}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}

export default Breadcrumb
