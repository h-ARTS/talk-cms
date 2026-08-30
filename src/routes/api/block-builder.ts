import { createFileRoute } from "@tanstack/react-router"
import axios from "axios"
import OpenAI from "openai"

type JsonObject = Record<string, unknown>

type PageElement = {
  type: string
  children?: PageElement[]
  content?: JsonObject
}

type JsonResponse = PageElement[]

type Block = {
  id: string
  type: string
  parentId: string | null
  content: JsonObject
}

type ValidationResult = {
  valid: boolean
  message: string
}

type UnsplashPhoto = {
  urls?: {
    regular?: string
  }
}

const supportedElements = ["Headline", "Card", "Grid", "Teaser", "Navbar"]

export const Route = createFileRoute("/api/block-builder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const requestBody: unknown = await request.json()
          const input = isJsonObject(requestBody) ? requestBody.input : undefined
          const userInput = JSON.stringify(input)
          const openai = createOpenAIClient()

          const openaiResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "user",
                content: `Given the user input (${userInput}), generate a JSON schema for a landing page using the following supported elements: ${supportedElements.join(
                  ", "
                )} and their properties:
                  - Headline: content (title, subtitle, cta_button_label, bg_image_url)
                  - Card: content (title, text, image_url, btn_label)
                  - Grid: content (margin, padding, columns)
                  - Teaser: content (margin, padding, bg_color)
                  - Navbar: content
                  The format should be: [{ type: 'element_type', children: [ { type: 'child_element_type', content: { key: 'value' } } ], content: { key: 'value' } }].
                  If a random image is requested, please utilize the Unsplash API. Treat the element types as case-insensitive.`,
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
          const validationResult = validateJsonSchema(
            processedJson,
            supportedElements
          )

          if (!validationResult.valid) {
            return Response.json(
              { error: validationResult.message },
              { status: 400 }
            )
          }

          const jsonWithImages = await addBackgroundImages(processedJson)
          return Response.json(flattenJsonResponse(jsonWithImages))
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

function processOpenAIResponse(responseText: string): JsonResponse {
  try {
    const jsonData: unknown = JSON.parse(responseText)
    if (!Array.isArray(jsonData)) {
      throw new Error("OpenAI response must be an array")
    }

    return jsonData.map(normalizePageElement)
  } catch (error) {
    console.error("Error processing OpenAI response:", error)
    throw new Error("Invalid JSON format in OpenAI response", { cause: error })
  }
}

function normalizePageElement(value: unknown): PageElement {
  if (!isJsonObject(value)) {
    throw new Error("OpenAI response contains an invalid element")
  }

  return {
    type: capitalizeFirstLetter(
      typeof value.type === "string" ? value.type : "unknown_type"
    ),
    children: Array.isArray(value.children)
      ? value.children.map(normalizePageElement)
      : [],
    content: isJsonObject(value.content) ? value.content : {},
  }
}

function capitalizeFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function validateJsonSchema(
  jsonSchema: JsonResponse,
  elements: string[]
): ValidationResult {
  for (const item of jsonSchema) {
    if (!elements.includes(item.type)) {
      const similarElement = findSimilarElement(item.type, elements)
      const message = similarElement
        ? `No ${item.type} element found. Similar element found: "${similarElement}". Would you like to create a ${similarElement} as a substitute for ${item.type} instead?`
        : `No ${item.type} element found in the project.`
      return { valid: false, message }
    }
  }

  return { valid: true, message: "Validation successful" }
}

function flattenJsonResponse(jsonResponse: JsonResponse): Block[] {
  const flattenedBlocks: Block[] = []

  function processBlock(block: PageElement, parentId: string | null) {
    const id = generateUniqueId()

    flattenedBlocks.push({
      id,
      type: block.type,
      parentId,
      content: block.content ?? {},
    })

    block.children?.forEach((child) => processBlock(child, id))
  }

  jsonResponse.forEach((block) => processBlock(block, null))
  return flattenedBlocks
}

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 11)
}

function findSimilarElement(
  element: string,
  elements: string[]
): string | null {
  const elementLower = element.toLowerCase()
  for (const supportedElement of elements) {
    if (supportedElement.toLowerCase().includes(elementLower)) {
      return supportedElement
    }
  }

  return null
}

async function addBackgroundImages(
  jsonSchema: JsonResponse
): Promise<JsonResponse> {
  const updatedSchema: JsonResponse = []

  for (const item of jsonSchema) {
    if (item.type === "Headline") {
      const randomImage = await getRandomUnsplashImage()
      updatedSchema.push({
        ...item,
        content: {
          ...item.content,
          bg_image_url: randomImage,
        },
      })
    } else {
      updatedSchema.push(item)
    }
  }

  return updatedSchema
}

async function getRandomUnsplashImage(): Promise<string> {
  try {
    const result = await axios.get<UnsplashPhoto>(
      "https://api.unsplash.com/photos/random",
      {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
        params: {
          query: "hero headline",
          ScreenOrientation: "landscape",
        },
      }
    )

    return result.data.urls?.regular ?? ""
  } catch (error) {
    console.error("Error fetching random image from Unsplash:", error)
    return ""
  }
}
