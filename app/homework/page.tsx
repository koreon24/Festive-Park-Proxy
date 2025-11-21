"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import HomeworkHelper from "@/components/homework-helper"
import LoadingScreen from "@/components/loading-screen"
import { isAdminEmail, getAdminName } from "@/lib/admin"

export default function HomeworkPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      if (isAdminEmail(authUser.email)) {
        setUser({
          email: authUser.email,
          full_name: getAdminName(authUser.email),
          is_admin: true,
        })
        setLoading(false)
        return
      }

      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email.toLowerCase())
        .single()

      if (error || !userData) {
        console.error("[v0] User not found in database:", error)
        alert("Your account is not approved yet. Please wait for admin approval.")
        router.push("/auth/login")
        return
      }

      setUser(userData)
      setLoading(false)
    } catch (err) {
      console.error("[v0] Auth check error:", err)
      router.push("/auth/login")
    }
  }

  if (loading) {
    return <LoadingScreen />
  }

  return <HomeworkHelper user={user} />
}
