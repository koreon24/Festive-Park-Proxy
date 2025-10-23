"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"

function CheckStatusContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [verification, setVerification] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(emailParam)
      checkStatusWithEmail(emailParam)
    }
  }, [searchParams])

  const checkStatusWithEmail = async (emailToCheck: string) => {
    setLoading(true)
    setError(null)
    setVerification(null)

    try {
      const supabase = createClient()
      const { data, error: queryError } = await supabase
        .from("verifications")
        .select("*")
        .eq("email", emailToCheck.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (queryError) {
        if (queryError.code === "PGRST116") {
          setError("No verification found for this email. Please submit a verification first.")
        } else {
          throw queryError
        }
        return
      }

      setVerification(data)
    } catch (err) {
      console.error("[v0] Error checking status:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    await checkStatusWithEmail(email)
  }

  const handleCreateAccount = () => {
    router.push(`/auth/signup?email=${encodeURIComponent(email)}`)
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Check Verification Status
            </CardTitle>
            <CardDescription>Enter your email to check your verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={checkStatus} className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {verification && (
                <Card className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status:</span>
                      <div className="flex items-center gap-2">
                        {verification.status === "approved" && (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <span className="text-green-500 font-medium">Verified</span>
                          </>
                        )}
                        {verification.status === "rejected" && (
                          <>
                            <XCircle className="w-5 h-5 text-red-500" />
                            <span className="text-red-500 font-medium">Declined</span>
                          </>
                        )}
                        {verification.status === "pending" && (
                          <>
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-yellow-500 font-medium">Pending</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <p>Name: {verification.full_name}</p>
                      <p>Submitted: {new Date(verification.created_at).toLocaleDateString()}</p>
                    </div>

                    {verification.status === "approved" && (
                      <div className="pt-4 border-t space-y-3">
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          🎉 Your verification has been approved!
                        </p>
                        <Button
                          onClick={handleCreateAccount}
                          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                        >
                          Create Account
                        </Button>
                      </div>
                    )}

                    {verification.status === "rejected" && verification.rejection_reason && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          <strong>Reason:</strong> {verification.rejection_reason}
                        </p>
                      </div>
                    )}

                    {verification.status === "pending" && (
                      <div className="pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Your verification is being reviewed. Please check back later.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  "Check Status"
                )}
              </Button>

              <div className="text-center text-sm space-y-2">
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors block">
                  ← Back to home
                </Link>
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

export default function CheckStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <CheckStatusContent />
    </Suspense>
  )
}
