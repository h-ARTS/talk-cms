import { createFileRoute } from "@tanstack/react-router"
import BlockDefinitionsPage from "@/blocks/management/BlockDefinitionsPage"

export const Route = createFileRoute("/blocks/")({
  component: BlockDefinitionsPage,
})
