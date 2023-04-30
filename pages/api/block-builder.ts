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

const supportedElements = ["headline", "card", "grid", "teaser", "navbar"]

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
          content: `Given the user input "${userInput}", generate a JSON schema for a landing page using only the supported elements [${supportedElements.join(
            ", "
          )}] and in the following format: [{ type: 'element_type', children: [ { type: 'child_element_type', content: { key: 'value' } } ], content: { key: 'value' } }]`,
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
      res.status(200).json(processedJson)
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
