import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { ActiveBlock, Block } from "@/types/types"

const initialState = {
  blocks: [] as Block[],
  activeBlock: null as ActiveBlock | null,
  navigationHistory: [] as string[],
}

const pageBuilderSlice = createSlice({
  name: "pageBuilder",
  initialState,
  reducers: {
    setActiveBlock: (state, action: PayloadAction<ActiveBlock | null>) => {
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
    setNavigationHistory: (state, action: PayloadAction<string[]>) => {
      state.navigationHistory = action.payload
    },
  },
})

export const {
  addBlock,
  moveBlock,
  deleteBlock,
  setActiveBlock,
  setNavigationHistory,
} = pageBuilderSlice.actions
export default pageBuilderSlice.reducer
