import axios from "axios"
import React, { useRef } from "react"
// Redux
import { addMessageToHistory } from "@/store/chatHistorySlice"
import { setBlocks } from "@/store/pageBuilderSlice"
import { useDispatch } from "react-redux"
// Mui
import ClickAwayListener from "@mui/core/ClickAwayListener"
import SendIcon from "@mui/icons-material/Send"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import TextField from "@mui/material/TextField"
import { useTheme } from "@mui/material"

interface ChatBoxProps {
  chatOpen: boolean
  onChatOpen: (chatOpen: boolean) => void
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatOpen, onChatOpen }) => {
  const theme = useTheme()
  const inputRef = useRef<HTMLInputElement>(null)
  const dispatch = useDispatch()

  const handleSubmit = async (input: string) => {
    try {
      const response = await axios.post("/api/block-builder", { input })
      dispatch(setBlocks(response.data))
      dispatch(addMessageToHistory(input))
    } catch (error) {
      console.error("Failed to submit the request:", error)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = inputRef.current!.value
    handleSubmit(input)
  }

  const handleClickAway = () => {
    onChatOpen(false)
  }

  return (
    <>
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          sx={{
            position: "fixed",
            bottom: theme.spacing(2),
            left: theme.spacing(2),
            width: 320,
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
          {/* Chat content */}
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
              />
              <IconButton
                color="primary"
                onClick={() => handleSubmit(inputRef.current?.value || "")}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </form>
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
    </>
  )
}

export default ChatBox
