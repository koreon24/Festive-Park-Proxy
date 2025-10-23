import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const ADMIN_ACCOUNTS = [
  {
    email: "carsonzhorse@gmail.com",
    password: "Cx7#mK9$pL2@vN4&wQ5!",
  },
  {
    email: "ChenEmperor1020@gmail.com",
    password: "Qw8!rT5#yU3$iO1@mP6%",
  },
]

export async function POST(request: Request) {
  try {
    const { secretKey } = await request.json()

    // Check if secret key matches environment variable
    if (secretKey !== process.env.ADMIN_SETUP_SECRET) {
      return NextResponse.json({ success: false, error: "Invalid secret key" }, { status: 403 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const adminEmails = ADMIN_ACCOUNTS.map((a) => a.email)
    const hasExistingAdmin = existingUsers?.users.some((u) => adminEmails.includes(u.email || ""))

    if (hasExistingAdmin) {
      return NextResponse.json(
        { success: false, error: "Admin accounts already exist. Setup can only be run once." },
        { status: 400 },
      )
    }

    const results = []

    for (const admin of ADMIN_ACCOUNTS) {
      // Create admin user with email confirmation bypassed
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true, // Bypass email confirmation
      })

      if (error) {
        results.push({ email: admin.email, status: "error", error: error.message })
      } else {
        results.push({ email: admin.email, status: "created", id: data.user?.id })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Admin setup complete",
      results,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
