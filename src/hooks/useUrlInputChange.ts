import { useState } from "react"
import { useInputChange } from "@/hooks/useInputChange"

const isValidUrl = (url: string) => {
  try {
    new URL(url)
    return true
  } catch (_) {
    return false
  }
}

export const useUrlInputChange = (
  onInputChange: (updatedContent: any) => void
) => {
  const [urlError, setUrlError] = useState(false)
  const handleInputChange = useInputChange(onInputChange)

  const handleUrlInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = event.target.value

    if (inputUrl === "" || isValidUrl(inputUrl)) {
      setUrlError(false)
    } else {
      setUrlError(true)
    }

    handleInputChange(event)
  }

  return { handleUrlInputChange, urlError }
}
