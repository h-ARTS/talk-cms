import { createFileRoute } from "@tanstack/react-router"
import OpenAI from "openai"
import { createBlockCatalog } from "@/blocks/core/ai"
import {
  validateGeneratedBlocks,
  type GeneratedBlock,
} from "@/blocks/core/validation"
import { listBlockDescriptors } from "@/blocks/server/definition-store"
import { compileBlockDefinition } from "@/blocks/core/compiler"
import { createBlockRegistry } from "@/blocks/core/registry"

type JsonObject = Record<string, unknown>

type Block = {
  id: string
  type: string
  parentId: string | null
  content: JsonObject
}

export const Route = createFileRoute("/api/internal/block-builder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const requestBody: unknown = await request.json()
          const input = isJsonObject(requestBody) ? requestBody.input : undefined
          const userInput = JSON.stringify(input)
          const descriptors = await listBlockDescriptors()
          const registry = createBlockRegistry(
            descriptors.map(compileBlockDefinition)
          )

          if (registry.definitions.length === 0) {
            return Response.json(
              { error: "Create at least one block definition before building a page." },
              { status: 400 }
            )
          }

          const openai = createOpenAIClient()

          const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Given the user input (${userInput}), generate a JSON structure for a landing page using only these block definitions:
                  ${createBlockCatalog(registry)}
                  The format should be: [{ type: 'element_type', children: [ { type: 'child_element_type', content: { key: 'value' } } ], content: { key: 'value' } }].
                  Treat the element types as case-insensitive.`,
              },
            ],
            max_completion_tokens: 500,
            n: 1,
            temperature: 1,
          })

          const responseText = openaiResponse.choices[0]?.message.content
          if (!responseText) {
            throw new Error("OpenAI returned an empty response")
          }

          const processedJson = processOpenAIResponse(responseText)
          const validationResult = validateGeneratedBlocks(processedJson, registry)

          if (!validationResult.success) {
            return Response.json(
              { error: validationResult.message },
              { status: 400 }
            )
          }

          return Response.json(flattenJsonResponse(validationResult.data))
        } catch (error) {
          console.error(error)
          return Response.json(
            { error: "An error occurred while processing your request." },
            { status: 500 }
          )
        }
      },
    },
  },
})

function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  return new OpenAI({
    apiKey,
    organization: process.env.OPENAI_ORG_ID || undefined,
  })
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function processOpenAIResponse(responseText: string): unknown {
  try {
    const jsonData: unknown = JSON.parse(responseText)
    if (!Array.isArray(jsonData)) {
      throw new Error("OpenAI response must be an array")
    }

    return jsonData
  } catch (error) {
    console.error("Error processing OpenAI response:", error)
    throw new Error("Invalid JSON format in OpenAI response", { cause: error })
  }
}

export function flattenJsonResponse(jsonResponse: GeneratedBlock[]): Block[] {
  const flattenedBlocks: Block[] = []

  function processBlock(block: GeneratedBlock, parentId: string | null) {
    const id = generateUniqueId()

    flattenedBlocks.push({
      id,
      type: block.type,
      parentId,
      content: block.content,
    })

    block.children?.forEach((child) => processBlock(child, id))
  }

  jsonResponse.forEach((block) => processBlock(block, null))
  return flattenedBlocks
}

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 11)
}
