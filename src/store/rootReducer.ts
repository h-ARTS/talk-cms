import { combineReducers } from "@reduxjs/toolkit"
import themeReducer from "./themeSlice"
import pageBuilderSlice from "./pageBuilderSlice"
import chatHistorySlice from "./chatHistorySlice"

const rootReducer = combineReducers({
  theme: themeReducer,
  pageBuilder: pageBuilderSlice,
  chatHistory: chatHistorySlice,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
