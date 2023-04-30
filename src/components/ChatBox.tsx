import React from "react"
import { Box, Input, IconButton, useTheme } from "@mui/material"
import SendIcon from "@mui/icons-material/Send"
import ClickAwayListener from "@mui/core/ClickAwayListener"

interface ChatBoxProps {
  chatOpen: boolean
  onChatOpen: (chatOpen: boolean) => void
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatOpen, onChatOpen }) => {
  const theme = useTheme()

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // Handle submit logic here
      event.preventDefault()
    }
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
            <Input
              placeholder="What do you want to build?"
              fullWidth
              onKeyDown={handleKeyDown}
            />
            <IconButton
              color="primary"
              onClick={() => {
                // Handle submit logic here
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
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
            zIndex: 9999,
          }}
          onClick={handleClickAway}
        ></div>
      )}
    </>
  )
}

export default ChatBox
