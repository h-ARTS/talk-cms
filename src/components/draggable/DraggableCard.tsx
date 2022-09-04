import React, { useRef } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useDrag, useDrop } from "react-dnd"

type DraggableCardProps = {
  id: string
  type: string
  index: number
  moveCard: (draggedId: string, hoverIndex: number) => void
  onClick: () => void
  onDelete: () => void
  children: React.ReactNode
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  type,
  index,
  moveCard,
  onClick,
  onDelete,
  children,
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
    onDelete()
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        marginBottom: "10px",
      }}
      onClick={onClick}
    >
      <Card>
        <CardContent>
          <Box display={"flex"} justifyContent={"space-between"}>
            <Typography variant="h6">{children}</Typography>
            <Tooltip title="Delete Block">
              <IconButton size="small" onClick={handleOnDelete}>
                <DeleteForeverIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
        <div></div>
      </Card>
    </div>
  )
}

export default DraggableCard
