import { combineReducers } from "@reduxjs/toolkit"
import themeReducer from "./themeSlice"
import pageBuilderSlice from "./pageBuilderSlice"

const rootReducer = combineReducers({
  theme: themeReducer,
  pageBuilder: pageBuilderSlice,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
