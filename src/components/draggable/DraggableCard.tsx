import React, { useRef } from "react"
import { Card, CardContent } from "@mui/material"
import { useDrag, useDrop } from "react-dnd"

type DraggableCardProps = {
  id: string
  type: string
  index: number
  moveCard: (draggedId: string, hoverIndex: number) => void
  onClick: () => void
  children: React.ReactNode
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  type,
  index,
  moveCard,
  onClick,
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
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}

export default DraggableCard
