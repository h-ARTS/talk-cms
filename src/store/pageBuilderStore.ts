import { create } from "zustand"
import { ActiveBlock, Block } from "@/types/index"

interface PageBuilderState {
  blocks: Block[]
  activeBlock: ActiveBlock | null
  navigationHistory: string[]
  /**
   * Human-readable name of the page being edited, empty string when unset
   */
  pageName: string
  /**
   * Sets the active block for the block editor, or null if parent selected
   */
  setActiveBlock: (block: ActiveBlock | null) => void
  /**
   * Adds a new block to the blocks array as a root/child
   */
  addBlock: (payload: { parent: string | null; block: Block }) => void
  /**
   * Sets the entire blocks array with new blocks hierarchy from the chat prompt
   */
  setBlocks: (blocks: Block[]) => void
  loadSavedPage: (blocks: Block[], name?: string | null) => void
  /**
   * Sets the page name from the page config tab
   */
  setPageName: (name: string) => void
  /**
   * Moves a block to a new position in the blocks array
   */
  moveBlock: (payload: { draggedId: string; hoverIndex: number }) => void
  /**
   * Deletes a block and its child blocks (if any) from the blocks array
   */
  deleteBlock: (id: string) => void
  /**
   * Sets the navigation history array in the state
   */
  setNavigationHistory: (history: string[]) => void
  /**
   * Updates the content of the specified block by merging with existing content
   */
  setBlockContent: (payload: {
    id: string
    content: Record<string, unknown>
  }) => void
}

export const usePageBuilderStore = create<PageBuilderState>()((set) => ({
  blocks: [],
  activeBlock: null,
  navigationHistory: [],
  pageName: "",

  setActiveBlock: (activeBlock) => set({ activeBlock }),

  addBlock: ({ block }) => set((state) => ({ blocks: [...state.blocks, block] })),

  setBlocks: (blocks) => set({ blocks }),

  loadSavedPage: (blocks, name) =>
    set({
      blocks,
      pageName: name ?? "",
      activeBlock: null,
      navigationHistory: [],
    }),

  setPageName: (pageName) => set({ pageName }),

  moveBlock: ({ draggedId, hoverIndex }) =>
    set((state) => {
      const draggedBlockIndex = state.blocks.findIndex(
        (block) => block.id === draggedId
      )
      if (draggedBlockIndex < 0) return state
      const blocks = [...state.blocks]
      const [draggedBlock] = blocks.splice(draggedBlockIndex, 1)
      blocks.splice(hoverIndex, 0, draggedBlock)
      return { blocks }
    }),

  deleteBlock: (id) =>
    set((state) => {
      const idsToDelete = new Set<string>()
      const collectRecursively = (blockId: string) => {
        const block = state.blocks.find((b) => b.id === blockId)
        if (!block || idsToDelete.has(blockId)) return
        idsToDelete.add(blockId)
        state.blocks
          .filter((b) => b.parentId === block.id)
          .forEach((child) => collectRecursively(child.id))
      }
      collectRecursively(id)
      return { blocks: state.blocks.filter((b) => !idsToDelete.has(b.id)) }
    }),

  setNavigationHistory: (navigationHistory) => set({ navigationHistory }),

  setBlockContent: ({ id, content }) =>
    set((state) => ({
      blocks: state.blocks.map((block) =>
        block.id === id
          ? { ...block, content: { ...block.content, ...content } }
          : block
      ),
    })),
}))
