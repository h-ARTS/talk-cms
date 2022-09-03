import React from "react"
import { Box, Button, ButtonGroup, Container, Typography } from "@mui/material"
import DraggableCard from "../draggable/DraggableCard"
import { useDrop } from "react-dnd"
import { v4 as uuidv4 } from "uuid"
// Redux
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../store/rootReducer"
import { addBlock, moveBlock } from "../../store/pageBuilderSlice"

type CardData = {
  id: string
  content: React.ReactNode
  type: "headline" | "teaser" | "grid" | "card"
}

const generateNewCard = (type: CardData["type"]): CardData => {
  const contentText = `New ${type}`
  return {
    id: uuidv4(),
    content: <Typography variant="h5">{contentText}</Typography>,
    type,
  }
}

const TabBlocks: React.FC = () => {
  const cards = useSelector((state: RootState) => state.pageBuilder)
  const dispatch = useDispatch()

  const moveCard = (draggedId: string, hoverIndex: number) => {
    dispatch(moveBlock({ draggedId, hoverIndex }))
  }

  const [, drop] = useDrop(() => ({
    accept: "card",
  }))

  const openSidebarSettings = (card: CardData) => {
    // Navigate to settings inside the sidebar and pass the card data
  }

  return (
    <Container>
      <Box ref={drop} sx={{ p: 2 }}>
        {cards.map((card, index) => (
          <DraggableCard
            key={card.id}
            id={card.id}
            type={card.type}
            index={index}
            moveCard={moveCard}
            onClick={() => openSidebarSettings(card)}
          >
            {card.content}
          </DraggableCard>
        ))}
      </Box>
    </Container>
  )
}

export default TabBlocks
