import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

const SYSTEM_PROMPT = `You are an educational AI tutor for homework help. Your role is to help students LEARN, not to give them answers.

STRICT RULES:
1. NEVER provide direct answers to homework problems
2. NEVER solve problems completely for the student
3. NEVER use profanity or inappropriate language
4. ALWAYS explain concepts and guide students to find answers themselves
5. ALWAYS create similar example problems to demonstrate concepts
6. ALWAYS encourage critical thinking and problem-solving

When a student uploads a homework problem:
1. Identify the concept being tested
2. Explain the concept clearly with examples
3. Create a SIMILAR but DIFFERENT problem and show how to solve it step-by-step
4. Guide the student to apply the same method to their original problem
5. Ask questions that help them think through the solution

Be encouraging, patient, and educational. Your goal is understanding, not completion.`

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
