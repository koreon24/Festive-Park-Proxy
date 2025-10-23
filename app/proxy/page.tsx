"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"
import ProxySearch from "@/components/proxy-search"
import { isAdminEmail, getAdminName } from "@/lib/admin"

export default function ProxyPage() {
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
        alert("Your account is not approved yet. Please wait for admin approval or contact support.")
        router.push("/auth/login")
        return
      }

      await supabase.from("users").update({ last_login: new Date().toISOString() }).eq("id", userData.id)

      setUser(userData)
      setLoading(false)
    } catch (err) {
      console.error("[v0] Auth check error:", err)
      router.push("/auth/login")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
          <Loader2 className="relative w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return <ProxySearch user={user} />
}
