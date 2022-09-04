import React, { useState } from "react"
import { Box, Tabs, Tab, ButtonGroup, Button } from "@mui/material"
import DraggableCard from "../draggable/DraggableCard"
import { v4 as uuidv4 } from "uuid"

export type BlockData = {
  id: string
  type: string
  content: React.ReactNode
  children: BlockData[]
}

type BlockContainerProps = {
  blocks: BlockData[] | undefined
  parentId?: string
  onBlockClick: (block: BlockData) => void
  moveBlock: (draggedId: string, hoverIndex: number) => void
  onDelete: (blockId: string) => void
  onAddBlock: (type: string, parentId?: string) => void
}

const BlockContainer: React.FC<BlockContainerProps> = ({
  blocks,
  parentId,
  onBlockClick,
  onAddBlock,
  moveBlock,
  onDelete,
}) => {
  return (
    <Box>
      {blocks?.map((block, index) => (
        <DraggableCard
          key={block.id}
          id={block.id}
          type={block.type}
          index={index}
          moveCard={moveBlock}
          onClick={() => onBlockClick(block)}
          onDelete={() => onDelete(block.id)}
        >
          {block.content}
        </DraggableCard>
      ))}
      <Box mt={5}>
        <ButtonGroup sx={{ mt: 2 }}>
          <Button onClick={() => onAddBlock("headline", parentId)}>
            Add Headline
          </Button>
          <Button onClick={() => onAddBlock("teaser", parentId)}>
            Add Teaser
          </Button>
          <Button onClick={() => onAddBlock("grid", parentId)}>Add Grid</Button>
          <Button onClick={() => onAddBlock("card", parentId)}>Add Card</Button>
        </ButtonGroup>
      </Box>
    </Box>
  )
}

export default BlockContainer
