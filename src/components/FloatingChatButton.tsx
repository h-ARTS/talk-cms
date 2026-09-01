import { MessageSquareIcon, XIcon } from "lucide-react"
import React from "react"

import { cn } from "@/ui/lib/utils"

type FloatingChatButtonProps = {
  chatOpen: boolean
  onChatOpen: (chatOpen: boolean) => void
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  chatOpen,
  onChatOpen,
}) => {
  return (
    <button
      type="button"
      aria-label={chatOpen ? "Close chat" : "Open chat"}
      onClick={() => onChatOpen(!chatOpen)}
      className={cn(
        "fixed bottom-8 left-5 z-[1000] inline-flex size-14 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring [&_svg]:size-6"
      )}
    >
      {chatOpen ? <XIcon /> : <MessageSquareIcon />}
    </button>
  )
}

export default FloatingChatButton
