import Fab from "@mui/material/Fab"
import ChatIcon from "@mui/icons-material/Chat"
import CloseIcon from "@mui/icons-material/Close"
import React from "react"
import { useTheme } from "@mui/material"

type FloatingChatButtonProps = {
  chatOpen: boolean
  onChatOpen: (chatOpen: boolean) => void
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  chatOpen,
  onChatOpen,
}) => {
  const theme = useTheme()

  return (
    <Fab
      color="primary"
      onClick={() => onChatOpen(!chatOpen)}
      style={{
        position: "fixed",
        bottom: theme.spacing(5),
        left: theme.spacing(3),
        zIndex: 1000,
      }}
    >
      {chatOpen ? <CloseIcon /> : <ChatIcon />}
    </Fab>
  )
}

export default FloatingChatButton
