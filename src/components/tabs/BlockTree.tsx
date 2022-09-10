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
// Redux
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "@/store/index"
import { addBlock, deleteBlock, moveBlock } from "@/store/pageBuilderSlice"
// Types
import { Block, BlockType } from "@/types/index"
// Components
import DraggableListItem from "../draggable/DraggableListItem"
import BlockEditor from "../BlockEditor"

interface BlockTreeProps {
  parentId: string | null
  onAddBlock?: (type: BlockType, parentId: string | null) => void
  onDeleteBlock?: (parentId: string | null) => void
  onNavigate: (id: string) => void
}

const BlockTree: React.FC<BlockTreeProps> = ({ parentId, onNavigate }) => {
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)
  const dispatch = useDispatch()

  const childBlocks = blocks.filter((block) => block.parentId === parentId)

  const handleAddBlock = (type: BlockType, parentId: string | null) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      parentId,
      content: {},
    }
    dispatch(addBlock({ parent: parentId, block: newBlock }))
  }

  const handleDeleteBlock = (blockId: string) => {
    dispatch(deleteBlock(blockId))
  }

  const handleMoveBlock = (draggedId: string, hoverIndex: number) => {
    dispatch(moveBlock({ draggedId, hoverIndex }))
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
      <Box px={2}>
        <Typography my={2} variant="subtitle2">
          Add Block:
        </Typography>
        <ButtonGroup variant="outlined" disableElevation>
          {Object.values(BlockType).map((type) => (
            <Button key={type} onClick={() => handleAddBlock(type, parentId)}>
              {type}
            </Button>
          ))}
        </ButtonGroup>
      </Box>
    </>
  )
}

export default BlockTree
