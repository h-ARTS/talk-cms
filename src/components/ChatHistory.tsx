import React from "react"
// Redux
import { useSelector } from "react-redux"
import { RootState } from "@/store/index"
// Mui
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemText from "@mui/material/ListItemText"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import DeleteIcon from "@mui/icons-material/Delete"

interface ChatHistoryProps {
  onHistoryItemClick: (input: string) => void
  onHistoryRemoveItem: (index: number) => void
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  onHistoryItemClick,
  onHistoryRemoveItem,
}) => {
  const history = useSelector((state: RootState) => state.chatHistory.history)

  const handleHistoryItemClick = (index: number) => {
    onHistoryItemClick(history[index])
  }

  const handleRemoveHistoryItem = (index: number) => {
    onHistoryRemoveItem(index)
  }

  return (
    <>
      <Typography
        variant="overline"
        display="block"
        px={2}
        pt={2}
        sx={{ lineHeight: 1 }}
      >
        Prompt History
      </Typography>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          maxHeight: "calc(100% - 56px)",
        }}
      >
        <List>
          {history.map((message, index) => (
            <ListItem
              disablePadding
              key={index}
              secondaryAction={
                <IconButton
                  color="error"
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleRemoveHistoryItem(index)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemButton
                dense
                onClick={() => handleHistoryItemClick(index)}
              >
                <ListItemText primary={message} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  )
}

export default ChatHistory
