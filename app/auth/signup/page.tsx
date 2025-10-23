"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Sparkles, Loader2 } from "lucide-react"

function SignupForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [checkingVerification, setCheckingVerification] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
      checkVerification(emailParam)
    }
  }, [searchParams])

  const checkVerification = async (emailToCheck: string) => {
    setCheckingVerification(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("verifications")
        .select("*")
        .eq("email", emailToCheck.toLowerCase())
        .eq("status", "approved")
        .single()

      if (error || !data) {
        setError("No approved verification found for this email. Please get verified first.")
        return
      }

      setFullName(data.full_name)
    } catch (err) {
      console.error("[v0] Error checking verification:", err)
      setError("Error checking verification status.")
    } finally {
      setCheckingVerification(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    console.log("[v0] Starting signup process for:", email)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()

      console.log("[v0] Checking verification status...")
      const { data: verification, error: verifyError } = await supabase
        .from("verifications")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("status", "approved")
        .single()

      if (verifyError) {
        if (verifyError.code === "PGRST116") {
          setError("No approved verification found. Please complete verification first.")
        } else {
          setError(`Verification error: ${verifyError.message}`)
        }
        setIsLoading(false)
        return
      }

      if (!verification) {
        setError("No approved verification found for this email.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Verification found:", verification)

      console.log("[v0] Creating auth account...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          emailRedirectTo: undefined,
        },
      })

      if (authError || !authData.user) {
        setError(`Account creation failed: ${authError?.message || "Unknown error"}`)
        setIsLoading(false)
        return
      }

      console.log("[v0] Auth account created:", authData.user.id)

      console.log("[v0] Adding user to database...")
      const { error: dbError } = await supabase.from("users").insert({
        id: authData.user.id,
        email: verification.email,
        full_name: verification.full_name,
      })

      if (dbError) {
        setError(`Database error: ${dbError.message}`)
        setIsLoading(false)
        return
      }

      console.log("[v0] User added to database.")

      if (authData.session) {
        router.push("/proxy")
      } else {
        router.push("/auth/login")
      }
    } catch (error: unknown) {
      console.error("[v0] Signup error:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  if (checkingVerification) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
          <Loader2 className="relative w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="glass-strong shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Create Account
            </CardTitle>
            <CardDescription>Create your account to access Festive Park proxy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass"
                    disabled={!!searchParams.get("email")}
                  />
                </div>
                {fullName && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-sm text-green-600 dark:text-green-400">
                      ✓ Verified as: <strong>{fullName}</strong>
                    </p>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass"
                    minLength={6}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    className="glass"
                    minLength={6}
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account & Access Proxy"
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <Link
                  href="/auth/login"
                  className="text-muted-foreground hover:text-foreground transition-colors block"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
