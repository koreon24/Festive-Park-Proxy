import { createServerClient } from "@supabase/ssr"
import { type NextRequest, NextResponse } from "next/server"
import { isAdminEmail } from "@/lib/admin"

export const updateSession = async (request: NextRequest) => {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wrotoqzgvykhxhmyzaox.supabase.co"
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyb3RvcXpndnlraHhobXl6YW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjYyNjgsImV4cCI6MjA3NTU0MjI2OH0.nvcs_4_d-aFWxtbx_9caDo76olPtqDi7TXyGaTWhULc"

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protected routes that require authentication
    if (request.nextUrl.pathname.startsWith("/proxy") || request.nextUrl.pathname.startsWith("/settings")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      if (request.nextUrl.pathname.startsWith("/proxy") && !isAdminEmail(user.email)) {
        const { data: userData } = await supabase.from("users").select("id").eq("email", user.email).single()

        if (!userData) {
          const url = request.nextUrl.clone()
          url.pathname = "/auth/login"
          url.searchParams.set("error", "User not found in database")
          return NextResponse.redirect(url)
        }
      }
    }

    // Admin routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/admin-login"
        return NextResponse.redirect(url)
      }
    }

    return response
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}
