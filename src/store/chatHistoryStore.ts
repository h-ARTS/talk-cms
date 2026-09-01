import { create } from "zustand"

interface ChatHistoryState {
  history: string[]
  addMessageToHistory: (message: string) => void
  deleteMessageHistory: (index: number) => void
}

export const useChatHistoryStore = create<ChatHistoryState>()((set) => ({
  history: [],
  addMessageToHistory: (message) =>
    set((state) => ({ history: [message, ...state.history] })),
  deleteMessageHistory: (index) =>
    set((state) => ({ history: state.history.filter((_, i) => i !== index) })),
}))
