import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { compileBlockDefinition } from "../core/compiler"
import {
  validateBlockDescriptors,
  type BlockDescriptor,
} from "../core/descriptor"
import { createBlockRegistry } from "../core/registry"
import { RegistryContext } from "./block-registry-context"

export function BlockRegistryProvider({ children }: { children: ReactNode }) {
  const [descriptors, setDescriptors] = useState<BlockDescriptor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/internal/block-definitions")
      const value: unknown = await response.json()
      if (!response.ok) throw new Error("Could not load block definitions")
      if (!Array.isArray(value)) throw new Error("Invalid block definition response")

      const parsed = validateBlockDescriptors(value)
      if (!parsed.success) throw new Error(parsed.message)
      setDescriptors(parsed.data)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load definitions")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void loadDescriptors().then((result) => {
      if (!active) return
      if (result.success) {
        setDescriptors(result.data)
        setError(null)
      } else {
        setError(result.message)
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const registry = useMemo(
    () =>
      createBlockRegistry(descriptors.map((descriptor) => compileBlockDefinition(descriptor))),
    [descriptors]
  )

  return (
    <RegistryContext.Provider
      value={{ descriptors, registry, loading, error, refresh }}
    >
      {children}
    </RegistryContext.Provider>
  )
}

async function loadDescriptors() {
  try {
    const response = await fetch("/api/internal/block-definitions")
    const value: unknown = await response.json()
    if (!response.ok) throw new Error("Could not load block definitions")
    if (!Array.isArray(value)) throw new Error("Invalid block definition response")
    return validateBlockDescriptors(value)
  } catch (cause) {
    return {
      success: false as const,
      message: cause instanceof Error ? cause.message : "Could not load definitions",
    }
  }
}
