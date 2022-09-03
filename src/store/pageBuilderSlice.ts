import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { v4 as uuidv4 } from "uuid"

type BlockData = {
  id: string
  type: "headline" | "teaser" | "grid" | "card"
  content: React.ReactNode
}

const initialState: BlockData[] = [
  {
    id: uuidv4(),
    type: "headline",
    content: "New Headline Block",
  },
]

const pageBuilderSlice = createSlice({
  name: "pageBuilder",
  initialState,
  reducers: {
    addBlock: (state, action: PayloadAction<BlockData>) => {
      state.push(action.payload)
    },
    moveBlock: (
      state,
      action: PayloadAction<{ draggedId: string; hoverIndex: number }>
    ) => {
      const { draggedId, hoverIndex } = action.payload
      const draggedBlockIndex = state.findIndex(
        (block) => block.id === draggedId
      )
      if (draggedBlockIndex < 0) return
      const draggedBlock = state[draggedBlockIndex]
      state.splice(draggedBlockIndex, 1)
      state.splice(hoverIndex, 0, draggedBlock)
    },
    deleteBlock: (state, action: PayloadAction<string>) => {
      const blockIndex = state.findIndex((block) => block.id === action.payload)
      if (blockIndex >= 0) {
        state.splice(blockIndex, 1)
      }
    },
  },
})

export const { addBlock, moveBlock, deleteBlock } = pageBuilderSlice.actions
export default pageBuilderSlice.reducer
