import React, { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
import { Trash2Icon, GripVerticalIcon } from "lucide-react"
import { useDispatch } from "react-redux"
import { setActiveBlock } from "@/store/pageBuilderSlice"

import { cn } from "@/ui/lib/utils"

type DraggableListItemProps = {
  id: string
  type: string
  index: number
  moveCard: (draggedId: string, hoverIndex: number) => void
  onClick: (id: string) => void
  onDelete: (id: string) => void
}

const DraggableListItem: React.FC<DraggableListItemProps> = ({
  id,
  type,
  index,
  moveCard,
  onClick,
  onDelete,
}) => {
  const dispatch = useDispatch()
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop({
    accept: "card",
    hover(item: { id: string; index: number }) {
      if (!ref.current) {
        return
      }
      const draggedId = item.id
      if (draggedId === id) {
        return
      }
      const hoverIndex = index
      moveCard(draggedId, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "card",
    item: { id, type, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }))

  drag(drop(ref))

  const handleOnDelete = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    onDelete(id)
  }

  const handleOnClick = (event: React.SyntheticEvent) => {
    event.stopPropagation()
    onClick(id)
    dispatch(setActiveBlock({ id, type }))
  }

  return (
    <div ref={ref} className={cn(isDragging && "opacity-50")}>
      <div className="group flex items-center gap-1 rounded-md transition-colors duration-150 hover:bg-accent/50">
        <GripVerticalIcon
          className="ml-1 size-4 shrink-0 cursor-grab text-muted-foreground/50"
          aria-hidden
        />
        <button
          type="button"
          onClick={handleOnClick}
          className="min-w-0 flex-1 cursor-pointer rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-ring"
        >
          <span className="block truncate">{type}</span>
        </button>
        <button
          type="button"
          aria-label="Delete block"
          onClick={handleOnDelete}
          className="mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover:opacity-100 [&_svg]:size-4"
        >
          <Trash2Icon />
        </button>
      </div>
    </div>
  )
}

export default DraggableListItem
