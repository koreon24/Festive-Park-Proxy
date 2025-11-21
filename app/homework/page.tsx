"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import HomeworkHelper from "@/components/homework-helper"
import LoadingScreen from "@/components/loading-screen"

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

      const { data: userData } = await supabase.from("users").select("*").eq("id", authUser.id).single()

      setUser(userData || { email: authUser.email, full_name: authUser.email?.split("@")[0] })
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
