import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to proxy login page after successful confirmation
      return NextResponse.redirect(`${origin}/auth/login?confirmed=true`)
    }
  }

  // If there's an error or no code, redirect to login with error
  return NextResponse.redirect(`${origin}/auth/login?error=confirmation_failed`)
}
