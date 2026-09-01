import React from "react"
import { ChevronRightIcon } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { RootState } from "@/store/index"
import { setNavigationHistory } from "@/store/pageBuilderSlice"

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
    <nav aria-label="breadcrumb" className="mx-3 my-2">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li>
          {navigationHistory.length === 0 ? (
            <span className="font-medium text-foreground">Page</span>
          ) : (
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(-1)}
              className="cursor-pointer rounded-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
            >
              Page
            </button>
          )}
        </li>
        {navigationHistory.map((id, index) => {
          const block = blocks.find((b) => b.id === id)
          const isLast = index === navigationHistory.length - 1
          return (
            <li key={id} className="flex items-center gap-1">
              <ChevronRightIcon className="size-3.5 text-muted-foreground" aria-hidden />
              {isLast ? (
                <span className="font-medium text-foreground">{block?.type}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(index)}
                  className="cursor-pointer rounded-sm text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                >
                  {block?.type}
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
