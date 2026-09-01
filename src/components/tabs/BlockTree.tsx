import React from "react"
// Mui
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  List,
  ListSubheader,
  Typography,
} from "@mui/material"
// Store
import { usePageBuilderStore } from "@/store/index"
// Types
import { useBlockRegistry } from "@/blocks/client/block-registry-context"
// Components
import DraggableListItem from "../draggable/DraggableListItem"
import BlockEditor from "../BlockEditor"

interface BlockTreeProps {
  parentId: string | null
  onAddBlock?: (type: string, parentId: string | null) => void
  onDeleteBlock?: (parentId: string | null) => void
  onNavigate: (id: string) => void
}

const BlockTree: React.FC<BlockTreeProps> = ({ parentId, onNavigate }) => {
  const blocks = usePageBuilderStore((state) => state.blocks)
  const addBlock = usePageBuilderStore((state) => state.addBlock)
  const deleteBlock = usePageBuilderStore((state) => state.deleteBlock)
  const moveBlock = usePageBuilderStore((state) => state.moveBlock)
  const { registry, loading } = useBlockRegistry()

  const childBlocks = blocks.filter((block) => block.parentId === parentId)
  const parentBlock = blocks.find((block) => block.id === parentId)
  const availableDefinitions =
    parentId === null
      ? registry.getAllowedDefinitions()
      : parentBlock
        ? registry.getAllowedDefinitions(parentBlock.type)
        : []

  const handleAddBlock = (type: string, parentId: string | null) => {
    const parent = blocks.find((block) => block.id === parentId)
    if (
      parentId !== null &&
      (!parent || !registry.allowsChild(parent.type, type))
    ) {
      return
    }

    const newBlock = registry.createBlock(
      type,
      parentId,
      crypto.randomUUID()
    )
    addBlock({ parent: parentId, block: newBlock })
  }

  const handleDeleteBlock = (blockId: string) => {
    deleteBlock(blockId)
  }

  const handleMoveBlock = (draggedId: string, hoverIndex: number) => {
    moveBlock({ draggedId, hoverIndex })
  }

  return (
    <>
      <BlockEditor />
      <Divider />
      <List subheader={<ListSubheader>Childrens</ListSubheader>}>
        {childBlocks.map((block, idx) => (
          <DraggableListItem
            key={block.id}
            id={block.id}
            index={idx}
            type={block.type}
            moveCard={handleMoveBlock}
            onClick={() => onNavigate(block.id)}
            onDelete={() => handleDeleteBlock(block.id)}
          />
        ))}
      </List>
      <Divider />
      <Box sx={{ px: 2 }}>
        <Typography sx={{ my: 2 }} variant="subtitle2">
          Add Block:
        </Typography>
        <ButtonGroup variant="outlined" disableElevation disabled={loading}>
          {availableDefinitions.map((definition) => (
            <Button
              key={definition.name}
              onClick={() => handleAddBlock(definition.name, parentId)}
            >
              {definition.metadata.label}
            </Button>
          ))}
        </ButtonGroup>
        {!loading && availableDefinitions.length === 0 && (
          <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
            No block definitions are available. Create one from Block definitions.
          </Typography>
        )}
      </Box>
    </>
  )
}

export default BlockTree
