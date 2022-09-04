import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import { PayloadAction } from "@reduxjs/toolkit"
import { Button } from "@mui/material"
import BlockContainer, { BlockData } from "./BlockContainer"
import { RootState } from "../../store/rootReducer"
import {
  addBlock,
  moveBlock,
  deleteBlock,
  addChildBlock,
  setActiveBlock,
} from "../../store/pageBuilderSlice"
import { v4 as uuidv4 } from "uuid"

const TabBlocks: React.FC = () => {
  const [navigationHistory, setNavigationHistory] = useState<
    (BlockData | null)[]
  >([])
  const dispatch = useDispatch()
  const activeBlock = useSelector(
    (state: RootState) => state.pageBuilder.activeBlock
  )
  const blocks = useSelector((state: RootState) => state.pageBuilder.blocks)

  useEffect(() => {
    dispatch(setActiveBlock(null))
  }, [blocks, dispatch])

  const handleAddBlock = (type: string, parentId?: string) => {
    const newBlock: BlockData = {
      id: uuidv4(),
      type,
      content: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Block`,
      children: [],
    }

    if (parentId) {
      dispatch(addChildBlock({ parentId, child: newBlock }))
    } else {
      dispatch(addBlock(newBlock))
    }
  }

  const handleMoveBlock = (draggedId: string, hoverIndex: number) => {
    dispatch(moveBlock({ draggedId, hoverIndex }))
  }

  const handleDeleteBlock = (blockId: string) => {
    dispatch(deleteBlock(blockId))
  }

  const handleBlockClick = (block: BlockData) => {
    setNavigationHistory([...navigationHistory, activeBlock])
    dispatch(setActiveBlock(block))
  }

  const handleBackClick = () => {
    const previousBlock = navigationHistory[navigationHistory.length - 1]
    dispatch(setActiveBlock(previousBlock))
    setNavigationHistory(navigationHistory.slice(0, -1))
  }

  return (
    <React.Fragment>
      {activeBlock ? (
        <React.Fragment>
          <Button onClick={handleBackClick}>Back</Button>
          <BlockContainer
            blocks={activeBlock.children}
            onBlockClick={handleBlockClick}
            moveBlock={handleMoveBlock}
            onDelete={handleDeleteBlock}
            parentId={activeBlock.id}
            onAddBlock={(type) => handleAddBlock(type, activeBlock.id)}
          />
        </React.Fragment>
      ) : (
        <BlockContainer
          blocks={blocks}
          onBlockClick={handleBlockClick}
          moveBlock={handleMoveBlock}
          onDelete={handleDeleteBlock}
          onAddBlock={handleAddBlock}
        />
      )}
    </React.Fragment>
  )
}

export default TabBlocks
