import axios from "axios"
import React, { useRef, useState } from "react"
// Redux
import {
  addMessageToHistory,
  deleteMessageHistory,
} from "@/store/chatHistorySlice"
import { setBlocks } from "@/store/pageBuilderSlice"
import { useDispatch } from "react-redux"
// Mui
import Alert from "@mui/material/Alert"
import ClickAwayListener from "@mui/core/ClickAwayListener"
import SendIcon from "@mui/icons-material/Send"
import Box from "@mui/material/Box"
import CircularProgress from "@mui/material/CircularProgress"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import Slide from "@mui/material/Slide"
import Snackbar from "@mui/material/Snackbar"
import { AlertColor, useTheme } from "@mui/material"
// Components
import ChatHistory from "./ChatHistory"

interface ChatBoxProps {
  chatOpen: boolean
  onChatOpen: (chatOpen: boolean) => void
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatOpen, onChatOpen }) => {
  const theme = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ message: string; type: string } | null>(
    null
  )

  const handleSubmit = async (input: string) => {
    setLoading(true)
    try {
      const response = await axios.post("/api/block-builder", { input })
      dispatch(setBlocks(response.data))
      dispatch(addMessageToHistory(input))
      setInputValue("")
      setAlert({
        type: "success",
        message: "Blocks successfully build.",
      })
    } catch (error) {
      setAlert({
        type: "error",
        message: "Failed to submit the request. Please try again.",
      })
      console.error("Failed to submit the request:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSubmit(inputValue)
  }

  const handleClickAway = () => {
    onChatOpen(false)
  }

  const handleCloseAlert = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return
    }

    setAlert(null)
  }

  const handleRemoveHistoryItem = (index: number) => {
    dispatch(deleteMessageHistory(index))
  }

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          sx={{
            position: "fixed",
            bottom: theme.spacing(2),
            left: theme.spacing(2),
            width: 400,
            height: 400,
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.spacing(1),
            boxShadow: theme.shadows[4],
            zIndex: 999,
            display: chatOpen ? "block" : "none",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            pb: 1,
            pt: 1,
          }}
        >
          <form onSubmit={handleKeyDown}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                pl: 1,
                pr: 1,
              }}
            >
              <TextField
                InputProps={{
                  inputRef,
                }}
                placeholder="What do you want to build?"
                minRows={1}
                maxRows={5}
                multiline
                style={{
                  width: "100%",
                  overflow: "hidden",
                  paddingRight: theme.spacing(1),
                }}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <IconButton
                color="primary"
                onClick={() => handleSubmit(inputRef.current?.value || "")}
              >
                {loading ? <CircularProgress size={24} /> : <SendIcon />}
              </IconButton>
            </Box>
          </form>
          <ChatHistory
            onHistoryItemClick={handleSubmit}
            onHistoryRemoveItem={handleRemoveHistoryItem}
          />
        </Box>
      </ClickAwayListener>
      {chatOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          }}
          onClick={handleClickAway}
        ></div>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={!!alert}
        autoHideDuration={10000}
        onClose={handleCloseAlert}
        TransitionComponent={Slide}
      >
        <Alert severity={alert?.type as AlertColor} onClose={handleCloseAlert}>
          {alert?.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ChatBox
