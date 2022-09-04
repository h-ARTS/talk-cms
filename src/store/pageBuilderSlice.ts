import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BlockData } from "../components/tabs/BlockContainer"

const initialState = {
  blocks: [] as BlockData[],
  activeBlock: null as BlockData | null,
}

const addBlockToChildren = (
  blocks: BlockData[],
  parentId: string,
  child: BlockData
) => {
  for (const block of blocks) {
    if (block.id === parentId) {
      block.children?.push(child)
      return true
    } else if (
      block.children &&
      addBlockToChildren(block.children, parentId, child)
    ) {
      return true
    }
  }
  return false
}

const removeBlockFromChildren = (
  blocks: BlockData[],
  blockId: string,
  found: { value: boolean }
) => {
  for (let i = 0; i < blocks.length; i++) {
    if (blocks[i].id === blockId) {
      blocks.splice(i, 1)
      found.value = true
      return
    } else if (blocks[i].children) {
      removeBlockFromChildren(blocks[i].children, blockId, found)
      if (found.value) return
    }
  }
}

const pageBuilderSlice = createSlice({
  name: "pageBuilder",
  initialState,
  reducers: {
    setActiveBlock: (state, action: PayloadAction<BlockData | null>) => {
      state.activeBlock = action.payload
    },
    addBlock: (state, action: PayloadAction<BlockData>) => {
      state.blocks.push(action.payload)
    },
    moveBlock: (
      state,
      action: PayloadAction<{ draggedId: string; hoverIndex: number }>
    ) => {
      const { draggedId, hoverIndex } = action.payload
      const draggedBlockIndex = state.blocks.findIndex(
        (block) => block.id === draggedId
      )
      if (draggedBlockIndex < 0) return
      const draggedBlock = state.blocks[draggedBlockIndex]
      state.blocks.splice(draggedBlockIndex, 1)
      state.blocks.splice(hoverIndex, 0, draggedBlock)
    },
    deleteBlock: (state, action: PayloadAction<string>) => {
      const blockId = action.payload
      const found = { value: false }
      removeBlockFromChildren(state.blocks, blockId, found)
    },
    addChildBlock: (
      state,
      action: PayloadAction<{ parentId: string; child: BlockData }>
    ) => {
      const { parentId, child } = action.payload
      addBlockToChildren(state.blocks, parentId, child)
    },
  },
})

export const {
  addBlock,
  moveBlock,
  deleteBlock,
  addChildBlock,
  setActiveBlock,
} = pageBuilderSlice.actions
export default pageBuilderSlice.reducer
