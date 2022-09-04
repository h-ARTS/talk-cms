import React from "react"
import { Box, Button, ButtonGroup, Container, Typography } from "@mui/material"
import DraggableCard from "../draggable/DraggableCard"
import { useDrop } from "react-dnd"
import { v4 as uuidv4 } from "uuid"
// Redux
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/src/store/rootReducer"
import { addBlock, deleteBlock, moveBlock } from "@/src/store/pageBuilderSlice"

type CardData = {
  id: string
  content: string
  type: "headline" | "teaser" | "grid" | "card"
}

const generateNewCard = (type: CardData["type"]): CardData => {
  const contentText = `New ${type}`
  return {
    id: uuidv4(),
    content: contentText,
    type,
  }
}

const TabBlocks: React.FC = () => {
  const cards = useSelector((state: RootState) => state.pageBuilder)
  const dispatch = useDispatch()

  const handleAddCard = (type: CardData["type"]) => {
    dispatch(addBlock(generateNewCard(type)))
  }

  const moveCard = (draggedId: string, hoverIndex: number) => {
    dispatch(moveBlock({ draggedId, hoverIndex }))
  }

  const handleDeleteCard = (cardId: string) => {
    dispatch(deleteBlock(cardId))
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
            onDelete={() => handleDeleteCard(card.id)}
          >
            {card.content}
          </DraggableCard>
        ))}
      </Box>
      <Box mt={5}>
        <ButtonGroup sx={{ mt: 2 }}>
          <Button onClick={() => handleAddCard("headline")}>
            Add Headline
          </Button>
          <Button onClick={() => handleAddCard("teaser")}>Add Teaser</Button>
          <Button onClick={() => handleAddCard("grid")}>Add Grid</Button>
          <Button onClick={() => handleAddCard("card")}>Add Card</Button>
        </ButtonGroup>
      </Box>
    </Container>
  )
}

export default TabBlocks
