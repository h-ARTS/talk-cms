import { createContext, useContext } from "react"
import type { BlockDescriptor } from "../core/descriptor"
import type { BlockRegistry } from "../core/registry"

export type RegistryContextValue = {
  descriptors: BlockDescriptor[]
  registry: BlockRegistry
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export const RegistryContext = createContext<RegistryContextValue | null>(null)

export function useBlockRegistry() {
  const context = useContext(RegistryContext)
  if (!context) throw new Error("useBlockRegistry must be used within BlockRegistryProvider")
  return context
}
