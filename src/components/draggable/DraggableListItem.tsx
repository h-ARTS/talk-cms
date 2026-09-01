import React, { useRef } from "react"
import { useDrag, useDrop } from "react-dnd"
// Mui
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
// store
import { usePageBuilderStore } from "@/store/index"
// Types

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
  const setActiveBlock = usePageBuilderStore((state) => state.setActiveBlock)
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
    setActiveBlock({ id, type })
  }

  return (
    <div ref={ref}>
      <ListItem
        sx={{
          opacity: isDragging ? 0.5 : 1,
        }}
        disablePadding
        secondaryAction={
          <IconButton edge="end" aria-label="delete" onClick={handleOnDelete}>
            <DeleteForeverIcon />
          </IconButton>
        }
      >
        <ListItemButton disableRipple onClick={handleOnClick}>
          <ListItemText>{type}</ListItemText>
        </ListItemButton>
      </ListItem>
    </div>
  )
}

export default DraggableListItem
