import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const SYSTEM_PROMPT = `You are a friendly and helpful AI homework assistant. Your goal is to help students learn by:

1. **Answering questions clearly and directly** - Don't avoid questions. If asked "what is 2+2?", answer "2+2 equals 4."
2. **Explaining the concept** - After answering, explain WHY and HOW it works
3. **Providing examples** - Give additional similar examples to reinforce understanding
4. **Encouraging learning** - Be supportive and help build confidence

Guidelines:
- Answer questions directly and accurately
- Explain concepts in simple, clear language
- Use step-by-step breakdowns for complex problems
- Provide helpful tips and tricks
- Be encouraging and patient
- Never use profanity or inappropriate language
- For complex homework problems, guide them through the solution process while explaining each step

Be conversational, friendly, and genuinely helpful. Your goal is to make learning easier and more enjoyable.`

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] Homework help API called")

    if (!process.env.OPENAI_API_KEY) {
      console.error("[v0] Missing OPENAI_API_KEY environment variable")
      return NextResponse.json(
        {
          error: "AI service not configured. Please add your OPENAI_API_KEY to environment variables.",
        },
        { status: 500 },
      )
    }

    const body = await req.json()
    console.log("[v0] Request body:", JSON.stringify(body).substring(0, 200))

    const { messages, imageUrl } = body

    const lastMessage = messages[messages.length - 1]
    let prompt = lastMessage.content

    if (imageUrl) {
      prompt = `[Student uploaded an image of their homework: ${imageUrl}]\n\n${prompt || "Can you help me understand this problem?"}`
    }

    console.log("[v0] Generating homework help response for:", prompt.substring(0, 100))

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const result = await generateText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    console.log("[v0] AI response received:", result.text.substring(0, 100))

    const filteredText = result.text.replace(/\b(fuck|shit|damn|hell|ass|bitch)\b/gi, "***")

    return NextResponse.json({ response: filteredText })
  } catch (error: any) {
    console.error("[v0] Homework help API error:", error)
    console.error("[v0] Error message:", error.message)

    return NextResponse.json(
      {
        error:
          "I'm having trouble connecting right now. Please add your OPENAI_API_KEY to environment variables in the Vars section.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
