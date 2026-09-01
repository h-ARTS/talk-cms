import { fileURLToPath, URL } from "node:url"

import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

const r = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@/components": r("./src/components"),
      "@/ui": r("./src/ui"),
      "@/blocks": r("./src/blocks"),
      "@/store": r("./src/store"),
      "@/hooks": r("./src/hooks"),
      "@/pages": r("./src/pages"),
      "@/styles": r("./src/styles"),
      "@/types": r("./types"),
    },
  },
  plugins: [tanstackStart(), nitro(), tailwindcss(), viteReact()],
})
