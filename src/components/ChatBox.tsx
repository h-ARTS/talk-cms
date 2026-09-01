import axios from "axios"
import React, { useState } from "react"
import { SendIcon, SparklesIcon } from "lucide-react"
import { useChatHistoryStore, usePageBuilderStore } from "@/store/index"

import ChatHistory from "./ChatHistory"
import { validateStoredBlocks } from "@/blocks/core/validation"
import { useBlockRegistry } from "@/blocks/client/block-registry-context"

import { Label } from "@/ui/label"
import { Spinner } from "@/ui/spinner"
import { Textarea } from "@/ui/textarea"
import { Toaster, type ToastItem } from "@/ui/toast"

const ChatBox: React.FC = () => {
  const { registry } = useBlockRegistry()
  const setBlocks = usePageBuilderStore((state) => state.setBlocks)
  const setActiveBlock = usePageBuilderStore((state) => state.setActiveBlock)
  const setNavigationHistory = usePageBuilderStore(
    (state) => state.setNavigationHistory
  )
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
    const prompt = input.trim()
    if (!prompt || loading) return

    setLoading(true)
    try {
      const response = await axios.post<unknown>("/api/internal/block-builder", {
        input: prompt,
      })
      const blocks = validateStoredBlocks(response.data, registry)
      if (!blocks.success) throw new Error(blocks.message)
      setBlocks(blocks.data)
      setActiveBlock(null)
      setNavigationHistory([])
      addMessageToHistory(prompt)
      setInputValue("")
      pushToast("success", "Page blocks created successfully.")
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

  return (
    <>
      <aside
        aria-label="AI page assistant"
        className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-card text-card-foreground"
      >
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <SparklesIcon className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-sm font-semibold">
              AI page assistant
            </h2>
            <p className="truncate text-xs text-muted-foreground">
              Describe what you want to create
            </p>
          </div>
        </div>

        <ChatHistory
          onHistoryItemClick={(input) => void handleSubmit(input)}
          onHistoryRemoveItem={deleteMessageHistory}
        />

        <form onSubmit={handleSubmitForm} className="border-t border-border p-4">
          <Label htmlFor="page-assistant-prompt" className="text-xs text-muted-foreground">
            Your instructions
          </Label>
          <div className="relative mt-2">
            <Textarea
              id="page-assistant-prompt"
              value={inputValue}
              rows={4}
              placeholder="Create a landing page for…"
              onChange={(event) => setInputValue(event.target.value)}
              className="max-h-40 min-h-28 resize-none rounded-lg pb-11 pr-12"
            />
            <button
              type="submit"
              aria-label="Submit prompt"
              disabled={!inputValue.trim() || loading}
              className="absolute bottom-2 right-2 inline-flex size-9 cursor-pointer items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground [&_svg]:size-4"
            >
              {loading ? <Spinner size={16} /> : <SendIcon />}
            </button>
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Be specific about the audience, sections, and tone you need.
          </p>
        </form>
      </aside>
      <Toaster
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((toast) => toast.id !== id))}
      />
    </>
  )
}

export default ChatBox
