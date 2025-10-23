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
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react"

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const confirmed = searchParams.get("confirmed")
    const errorParam = searchParams.get("error")

    if (confirmed === "true") {
      setSuccess("Email confirmed successfully! You can now sign in.")
    } else if (errorParam === "confirmation_failed") {
      setError("Email confirmation failed. Please try again or contact support.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const supabase = createClient()

      console.log("[v0] Attempting login for:", email.toLowerCase())

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      })

      console.log("[v0] Auth response:", { authError })

      if (authError) {
        console.error("[v0] Auth error:", authError)

        setError("Invalid email or password. Please check your credentials and try again.")
        setIsLoading(false)
        return
      }

      console.log("[v0] Login successful, checking user status...")

      router.push("/proxy")
    } catch (error: unknown) {
      console.error("[v0] Unexpected error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
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
              Welcome Back
            </CardTitle>
            <CardDescription>Sign in to access Festive Park proxy</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                {success && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
                  </div>
                )}
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
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="glass"
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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  ← Back to home
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
      <LoginForm />
    </Suspense>
  )
}
