"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import ProxySearch from "@/components/proxy-search"
import OnboardingFlow from "@/components/onboarding-flow"
import LoadingScreen from "@/components/loading-screen"
import { isAdminEmail, getAdminName } from "@/lib/admin"

export default function ProxyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)

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
          has_completed_onboarding: true,
          theme: "liquid-glass",
        })
        setShowWelcomeBack(true)
        setTimeout(() => {
          setShowWelcomeBack(false)
          setLoading(false)
        }, 2000)
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

      if (!userData.has_completed_onboarding) {
        setShowOnboarding(true)
        setLoading(false)
      } else {
        setShowWelcomeBack(true)
        setTimeout(() => {
          setShowWelcomeBack(false)
          setLoading(false)
        }, 2000)
      }
    } catch (err) {
      console.error("[v0] Auth check error:", err)
      router.push("/auth/login")
    }
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    checkAuth()
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (showWelcomeBack && user) {
    const firstName = user.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User"
    return <LoadingScreen message={`Welcome back, ${firstName}`} />
  }

  if (showOnboarding && user) {
    return <OnboardingFlow user={user} onComplete={handleOnboardingComplete} />
  }

  return <ProxySearch user={user} />
}
