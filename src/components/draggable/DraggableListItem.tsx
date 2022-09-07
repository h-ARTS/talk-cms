import React, { useRef, useEffect } from "react"
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useDrag, useDrop } from "react-dnd"
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend"

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
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop({
    accept: "card",
    hover(item: any, monitor) {
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

  const [{ isDragging }, drag, preview] = useDrag(() => ({
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
        <ListItemButton onClick={handleOnClick}>
          <ListItemText>{type}</ListItemText>
        </ListItemButton>
      </ListItem>
    </div>
  )
}

export default DraggableListItem
