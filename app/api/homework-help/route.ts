import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

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
    const { messages, imageUrl } = await req.json()

    const lastMessage = messages[messages.length - 1]
    let prompt = lastMessage.content

    if (imageUrl) {
      prompt = `[Student uploaded an image of their homework: ${imageUrl}]\n\n${prompt || "Can you help me understand this problem?"}`
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: SYSTEM_PROMPT,
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 1000,
    })

    const filteredText = text.replace(/\b(fuck|shit|damn|hell|ass|bitch)\b/gi, "***")

    return NextResponse.json({ response: filteredText })
  } catch (error) {
    console.error("[v0] Homework help API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
