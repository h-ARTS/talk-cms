import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/api/internal/hello")({
  server: {
    handlers: {
      GET: () => Response.json({ name: "John Doe" }),
    },
  },
})
