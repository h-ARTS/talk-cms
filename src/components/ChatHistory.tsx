import React from "react"
import { HistoryIcon, Trash2Icon } from "lucide-react"
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
    <div className="flex min-h-0 flex-1 flex-col px-3 py-4">
      <p className="px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Recent instructions
      </p>
      {history.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-3 text-center">
          <HistoryIcon className="mb-3 size-5 text-muted-foreground/60" />
          <p className="text-sm font-medium text-foreground">Start with a page idea</p>
          <p className="mt-1 max-w-56 text-xs leading-5 text-muted-foreground">
            Your submitted instructions will appear here so you can reuse them.
          </p>
        </div>
      ) : (
        <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {history.map((message, index) => (
            <li key={`${message}-${index}`} className="group flex items-center gap-1">
              <button
                type="button"
                onClick={() => onHistoryItemClick(message)}
                className="min-w-0 flex-1 cursor-pointer rounded-lg border border-border px-3 py-2 text-left text-sm text-foreground transition-colors duration-150 hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="block truncate">{message}</span>
              </button>
              <button
                type="button"
                aria-label={`Delete instruction: ${message}`}
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
  )
}

export default ChatHistory
