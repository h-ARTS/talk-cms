import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { BlockData } from "../components/tabs/BlockContainer"
import { Block } from "@/types/types"

const initialState = {
  blocks: [] as Block[],
  activeBlock: null as BlockData | null,
  navigationHistory: [] as (BlockData | null)[],
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
    addBlock: (
      state,
      action: PayloadAction<{ parent: string | null; block: Block }>
    ) => {
      state.blocks.push(action.payload.block)
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
      // const blockId = action.payload
      // const found = { value: false }
      // removeBlockFromChildren(state.blocks, blockId, found)
      const deleteBlockRecursively = (blockId: string) => {
        const block = state.blocks.find((b) => b.id === blockId)
        if (!block) return

        // Find all child blocks and delete them recursively
        const childBlocks = state.blocks.filter((b) => b.parentId === block.id)
        childBlocks.forEach((child) => deleteBlockRecursively(child.id))

        // Delete the block itself
        const index = state.blocks.findIndex((b) => b.id === blockId)
        if (index !== -1) {
          state.blocks.splice(index, 1)
        }
      }

      deleteBlockRecursively(action.payload)
    },
    addChildBlock: (
      state,
      action: PayloadAction<{ parentId: string; child: BlockData }>
    ) => {
      const { parentId, child } = action.payload
      addBlockToChildren(state.blocks, parentId, child)
    },
    setNavigationHistory: (
      state,
      action: PayloadAction<(BlockData | null)[]>
    ) => {
      state.navigationHistory = action.payload
    },
  },
})

export const {
  addBlock,
  moveBlock,
  deleteBlock,
  addChildBlock,
  setActiveBlock,
  setNavigationHistory,
} = pageBuilderSlice.actions
export default pageBuilderSlice.reducer
