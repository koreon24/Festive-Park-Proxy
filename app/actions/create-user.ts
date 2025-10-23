"use server"

import { createClient } from "@/lib/supabase/server"

export async function createUserAccount(userId: string, email: string, fullName: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("users").insert({
    id: userId,
    email: email.toLowerCase(),
    full_name: fullName,
    is_active: true,
    theme: "light",
    background: null,
  })

  if (error && error.code !== "23505") {
    throw new Error(error.message)
  }

  return { success: true }
}
