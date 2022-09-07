import {
  Button,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
} from "@mui/material"
import { useSelector, useDispatch } from "react-redux"
import { addBlock, deleteBlock, moveBlock } from "@/src/store/pageBuilderSlice"
import { Block, BlockType } from "@/types/types"
import { RootState } from "@/src/store"
import { Delete as DeleteIcon } from "@mui/icons-material"
import DraggableListItem from "../draggable/DraggableListItem"

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
      content: "",
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
      <List subheader={<ListSubheader>Blocks</ListSubheader>}>
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
      {Object.values(BlockType).map((type) => (
        <Button
          key={type}
          onClick={() => handleAddBlock(type, parentId)}
          variant="contained"
        >
          Add {type}
        </Button>
      ))}
    </>
  )
}

export default BlockTree
