import axios from "axios"
import { NextApiRequest, NextApiResponse } from "next"
import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  organization: process.env.OPENAI_ORG_ID,
  apiKey: process.env.OPENAI_API_KEY,
})
const openai = new OpenAIApi(configuration)

type JsonResponse = Array<{
  type: string
  children?: Array<object>
  content?: object
}>

type Block = {
  id: string
  type: string
  parentId: string | null
  content: object
}

const supportedElements = ["Headline", "Card", "Grid", "Teaser", "Navbar"]

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JsonResponse | { error: string }>
) {
  const userInput = req.body.input

  try {
    const openaiResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Given the user input "${userInput}", generate a JSON schema for a landing page using the following supported elements: ${supportedElements.join(
            ", "
          )} and their properties:
          - Headline: content (title, subtitle, cta_button_label, bg_image_url)
          - Card: content (title, text, image_url, btn_label)
          - Grid: content (margin, padding, columns)
          - Teaser: content (margin, padding, bg_color)
          - Navbar: content
          The format should be: [{ type: 'element_type', children: [ { type: 'child_element_type', content: { key: 'value' } } ], content: { key: 'value' } }].
          If a random image is requested please utilized the unsplash api. Consider the elements as case-insensitive.`,
        },
      ],
      max_tokens: 500,
      n: 1,
      temperature: 1,
    })
    console.log(openaiResponse)

    const processedJson: JsonResponse = processOpenAIResponse(
      openaiResponse.data.choices[0].message?.content!
    )
    console.log(processedJson)
    const validationResult = validateJsonSchema(
      processedJson,
      supportedElements
    )
    console.log(validationResult)

    if (validationResult.valid) {
      const jsonWithImages = await addBackgroundImages(processedJson)
      const flattenResponse = flattenJsonResponse(jsonWithImages)
      res.status(200).json(flattenResponse)
    } else {
      res.status(400).json({ error: validationResult.message })
    }
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." })
  }
}

function processOpenAIResponse(responseText: string): JsonResponse {
  try {
    const jsonData: JsonResponse = JSON.parse(responseText)

    const processedJson = jsonData.map((item) => ({
      type: item.type || "unknown_type",
      children: item.children || [],
      content: item.content || {},
    }))

    return processedJson
  } catch (error) {
    console.error("Error processing OpenAI response:", error)
    throw new Error("Invalid JSON format in OpenAI response")
  }
}

type ValidationResult = {
  valid: boolean
  message: string
}

function validateJsonSchema(
  jsonSchema: JsonResponse,
  supportedElements: string[]
): ValidationResult {
  for (const item of jsonSchema) {
    if (!supportedElements.includes(item.type)) {
      const similarElement = findSimilarElement(item.type, supportedElements)
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

  function processBlock(block: any, parentId: string | null) {
    const id = generateUniqueId()

    flattenedBlocks.push({
      id,
      type: block.type,
      parentId,
      content: block.content,
    })

    if (block.children) {
      block.children.forEach((child: any) => {
        processBlock(child, id)
      })
    }
  }

  jsonResponse.forEach((block) => processBlock(block, null))

  return flattenedBlocks
}

function findSimilarElement(
  element: string,
  supportedElements: string[]
): string | null {
  const elementLower = element.toLowerCase()
  for (const supportedElement of supportedElements) {
    if (supportedElement.toLowerCase().includes(elementLower)) {
      return supportedElement
    }
  }
  return null
}

async function addBackgroundImages(
  jsonSchema: JsonResponse
): Promise<JsonResponse> {
  const updatedSchema = []

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
    const result = await axios.get("https://api.unsplash.com/photos/random", {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
      params: {
        query: "hero headline",
        ScreenOrientation: "landscape",
      },
    })

    return result.data.urls.regular
  } catch (error) {
    console.error("Error fetching random image from Unsplash:", error)
    return ""
  }
}
