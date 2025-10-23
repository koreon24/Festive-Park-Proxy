import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    const setupSecret = process.env.ADMIN_SETUP_SECRET

    if (!setupSecret) {
      return NextResponse.json({ valid: false, error: "Setup secret not configured" }, { status: 500 })
    }

    const valid = password === setupSecret

    return NextResponse.json({ valid })
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 })
  }
}
