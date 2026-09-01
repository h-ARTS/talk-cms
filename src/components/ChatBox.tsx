import axios from "axios"
import React, { useRef, useState } from "react"
import { useChatHistoryStore, usePageBuilderStore } from "@/store/index"
import { SendIcon } from "lucide-react"

import ChatHistory from "./ChatHistory"
import { validateStoredBlocks } from "@/blocks/core/validation"
import { useBlockRegistry } from "@/blocks/client/block-registry-context"

import { Spinner } from "@/ui/spinner"
import { Toaster, type ToastItem } from "@/ui/toast"

interface ChatBoxProps {
  chatOpen: boolean
  onChatOpen: (chatOpen: boolean) => void
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatOpen, onChatOpen }) => {
  const { registry } = useBlockRegistry()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const setBlocks = usePageBuilderStore((state) => state.setBlocks)
  const addMessageToHistory = useChatHistoryStore(
    (state) => state.addMessageToHistory
  )
  const deleteMessageHistory = useChatHistoryStore(
    (state) => state.deleteMessageHistory
  )
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = (variant: ToastItem["variant"], title: string) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, variant, title }])
  }

  const handleSubmit = async (input: string) => {
    if (!input.trim()) return
    setLoading(true)
    try {
      const response = await axios.post<unknown>("/api/internal/block-builder", {
        input,
      })
      const blocks = validateStoredBlocks(response.data, registry)
      if (!blocks.success) throw new Error(blocks.message)
      setBlocks(blocks.data)
      addMessageToHistory(input)
      setInputValue("")
      pushToast("success", "Blocks successfully built.")
    } catch (error) {
      pushToast("destructive", "Failed to submit the request. Please try again.")
      console.error("Failed to submit the request:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitForm = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    void handleSubmit(inputValue)
  }

  const handleRemoveHistoryItem = (index: number) => {
    deleteMessageHistory(index)
  }

  return (
    <>
      <div
        className="fixed bottom-4 left-4 z-[999] flex h-[420px] w-[400px] flex-col overflow-hidden rounded-xl border border-border bg-card py-1 shadow-2xl"
        style={{ display: chatOpen ? "flex" : "none" }}
      >
        <form onSubmit={handleSubmitForm} className="border-b border-border">
          <div className="flex items-start gap-2 px-3 py-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={inputValue}
              placeholder="What do you want to build?"
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  void handleSubmit(inputValue)
                }
              }}
              className="max-h-32 min-h-[36px] w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors duration-200 placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            />
            <button
              type="submit"
              aria-label="Submit prompt"
              disabled={loading}
              className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-primary transition-colors duration-200 hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50 [&_svg]:size-4"
            >
              {loading ? <Spinner size={16} /> : <SendIcon />}
            </button>
          </div>
        </form>
        <ChatHistory
          onHistoryItemClick={(input) => void handleSubmit(input)}
          onHistoryRemoveItem={handleRemoveHistoryItem}
        />
      </div>
      {chatOpen && (
        <div
          className="fixed inset-0 z-[998]"
          onMouseDown={() => onChatOpen(false)}
        />
      )}
      <Toaster
        toasts={toasts}
        onDismiss={(id) => setToasts((c) => c.filter((t) => t.id !== id))}
      />
    </>
  )
}

export default ChatBox
