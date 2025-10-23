"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SetupPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState("")
  const [secretKey, setSecretKey] = useState("")

  const verifyPassword = async () => {
    if (!password.trim()) {
      setAuthError("Please enter the password")
      return
    }

    setAuthLoading(true)
    setAuthError("")

    try {
      const response = await fetch("/api/verify-setup-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (data.valid) {
        setAuthenticated(true)
        setSecretKey(password) // Use the same password for setup
      } else {
        setAuthError("Invalid password")
      }
    } catch (err: any) {
      setAuthError("An error occurred")
    } finally {
      setAuthLoading(false)
    }
  }

  const setupAdmins = async () => {
    if (!secretKey.trim()) {
      setError("Please enter the setup secret key")
      return
    }

    setLoading(true)
    setError("")
    setResults(null)

    try {
      const response = await fetch("/api/setup-admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secretKey }),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      } else {
        setError(data.error || "Setup failed")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold mb-2">Admin Setup</h1>
          <p className="text-muted-foreground mb-6">Enter the setup password to access this page</p>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Setup Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPassword()}
              disabled={authLoading}
            />
          </div>

          <Button onClick={verifyPassword} disabled={authLoading} className="w-full" size="lg">
            {authLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              "Access Setup"
            )}
          </Button>

          {authError && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">{authError}</p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-2">Admin Setup</h1>
        <p className="text-muted-foreground mb-6">Create admin accounts. This can only be run once.</p>

        <Button onClick={setupAdmins} disabled={loading} className="w-full mb-6" size="lg">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up admins...
            </>
          ) : (
            "Create Admin Accounts"
          )}
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg mb-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {results && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Setup Results:</h2>
            {results.map((result: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                {result.status === "created" || result.status === "already_exists" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm break-all">{result.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {result.status === "created" && "Account created successfully"}
                    {result.status === "already_exists" && "Account already exists"}
                    {result.status === "error" && `Error: ${result.error}`}
                  </p>
                </div>
              </div>
            ))}

            <div className="mt-6 p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                ✓ Setup complete! You can now login at{" "}
                <a href="/auth/admin-login" className="underline">
                  /auth/admin-login
                </a>
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
