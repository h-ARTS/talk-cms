import {
  createAction,
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit"
import { ActiveBlock, Block } from "@/types/index"

const initialState = {
  blocks: [] as Block[],
  activeBlock: null as ActiveBlock | null,
  navigationHistory: [] as string[],
}

const pageBuilderSlice = createSlice({
  name: "pageBuilder",
  initialState,
  reducers: {
    /**
     * Sets the active block for the block edtior
     *
     * @param state the current redux state
     * @param action the new active block as payload or null if parent selected
     */
    setActiveBlock: (state, action: PayloadAction<ActiveBlock | null>) => {
      state.activeBlock = action.payload
    },
    /**
     * Sets a new block to the current state of blocks. It can either be a parent or a child
     *
     * @param state the current redux state
     * @param action block to be added to the current state of blocks as a root/child
     */
    addBlock: (
      state,
      action: PayloadAction<{ parent: string | null; block: Block }>
    ) => {
      state.blocks.push(action.payload.block)
    },
    /**
     * Sets the entire blocks array with new blocks hierarchy from the chat prompt
     *
     * @param state the current redux state
     * @param action blocks from the chat prompt to be added to the blocks array
     */
    setBlocks: (state, action: PayloadAction<Block[]>) => {
      state.blocks = action.payload
    },
    /**
     * Moves a block to a new position in the blocks array
     *
     * @param state the current redux state
     * @param action an object containing the dragged block's id and the new position (hoverIndex)
     */
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
    /**
     * Deletes a block and its child blocks (if any) from the blocks array
     *
     * @param state the current redux state
     * @param action the id of the block to be deleted
     */
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
    /**
     * Sets the navigation history array in the state
     *
     * @param state the current redux state
     * @param action the new navigation history array
     */
    setNavigationHistory: (state, action: PayloadAction<string[]>) => {
      state.navigationHistory = action.payload
    },
  },
  extraReducers(builder) {
    /**
     * Updates the content of the specified block
     *
     * @param state the current redux state
     * @param action an object containing the block id and updated content
     */
    builder.addCase(setBlockContent, (state, action) => {
      const { id, content } = action.payload
      const blockIndex = state.blocks.findIndex((block) => block.id === id)
      const block = state.blocks.find((b) => b.id === id)
      if (blockIndex !== -1) {
        state.blocks[blockIndex].content = { ...block?.content, ...content }
      }
    })
  },
})

/**
 * Thunk that dispatches setBlockContent action
 *
 * @param payload object containing block id and updated content
 * @param dispatch dispatch function for redux store
 */
export const updateBlockContent = createAsyncThunk(
  "pageBuilder/updateBlockContent",
  async (payload: { id: string; content: any }, { dispatch }) => {
    dispatch(setBlockContent(payload))
  }
)

/**
 * Action to set the content of the specified block
 *
 * @type id of the block to update
 * @type content new content object to merge with the existing content
 */
export const setBlockContent = createAction<{
  id: string
  content: any
}>("pageBuilder/setBlockContent")

export const {
  addBlock,
  setBlocks,
  moveBlock,
  deleteBlock,
  setActiveBlock,
  setNavigationHistory,
} = pageBuilderSlice.actions
export default pageBuilderSlice.reducer
