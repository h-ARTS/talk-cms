import { createFileRoute } from "@tanstack/react-router"
import {
  createBlockDescriptor,
  DefinitionStoreError,
  deleteBlockDescriptor,
  listBlockDescriptors,
  updateBlockDescriptor,
} from "@/blocks/server/definition-store"

export const Route = createFileRoute("/api/internal/block-definitions")({
  server: {
    handlers: {
      GET: async () => Response.json(await listBlockDescriptors()),
      POST: async ({ request }) =>
        handleMutation(async () => {
          const descriptor = await createBlockDescriptor(await request.json())
          return Response.json(descriptor, { status: 201 })
        }),
      PUT: async ({ request }) =>
        handleMutation(async () => {
          const name = requireName(request)
          const descriptor = await updateBlockDescriptor(name, await request.json())
          return Response.json(descriptor)
        }),
      DELETE: async ({ request }) =>
        handleMutation(async () => {
          await deleteBlockDescriptor(requireName(request))
          return new Response(null, { status: 204 })
        }),
    },
  },
})

async function handleMutation(mutation: () => Promise<Response>) {
  try {
    return await mutation()
  } catch (error) {
    const status = error instanceof DefinitionStoreError ? error.status : 500
    const message = error instanceof Error ? error.message : "Unexpected error"
    return Response.json({ error: message }, { status })
  }
}

function requireName(request: Request) {
  const name = new URL(request.url).searchParams.get("name")?.trim()
  if (!name) throw new DefinitionStoreError(400, "A block name is required")
  return name
}
