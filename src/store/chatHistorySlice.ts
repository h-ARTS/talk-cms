import { createSlice, PayloadAction } from "@reduxjs/toolkit"

interface ChatHistoryState {
  history: string[]
}

const initialState: ChatHistoryState = {
  history: [],
}

const chatHistorySlice = createSlice({
  name: "chatHistory",
  initialState,
  reducers: {
    addMessageToHistory: (state, action: PayloadAction<string>) => {
      state.history.unshift(action.payload)
    },
    deleteMessageHistory: (state, action: PayloadAction<number>) => {
      state.history.splice(action.payload, 1)
    },
  },
})

export const { addMessageToHistory, deleteMessageHistory } =
  chatHistorySlice.actions

export default chatHistorySlice.reducer
