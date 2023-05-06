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
      state.history.push(action.payload)
    },
  },
})

export const { addMessageToHistory } = chatHistorySlice.actions

export default chatHistorySlice.reducer
