import React from "react"
import { Trash2Icon } from "lucide-react"
import { useChatHistoryStore } from "@/store/index"

interface ChatHistoryProps {
  onHistoryItemClick: (input: string) => void
  onHistoryRemoveItem: (index: number) => void
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  onHistoryItemClick,
  onHistoryRemoveItem,
}) => {
  const history = useChatHistoryStore((state) => state.history)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="px-4 pt-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Prompt history
      </p>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {history.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">
            Your previous prompts will appear here.
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {history.map((message, index) => (
              <li key={index} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onHistoryItemClick(history[index])}
                  className="min-w-0 flex-1 cursor-pointer rounded-md px-2 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
                >
                  <span className="block truncate">{message}</span>
                </button>
                <button
                  type="button"
                  aria-label="Remove prompt"
                  onClick={() => onHistoryRemoveItem(index)}
                  className="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all duration-150 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring group-hover:opacity-100 [&_svg]:size-4"
                >
                  <Trash2Icon />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ChatHistory
