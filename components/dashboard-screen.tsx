"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, Loader2, User, Calendar, Mail, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface DashboardScreenProps {
  email: string
}

export default function DashboardScreen({ email }: DashboardScreenProps) {
  const [loading, setLoading] = useState(true)
  const [verification, setVerification] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadVerificationStatus()
  }, [email])

  const loadVerificationStatus = async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

      const { data, error: dbError } = await supabase
        .from("verifications")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (dbError) {
        if (dbError.code === "PGRST116") {
          setError("No verification found")
        } else {
          throw dbError
        }
      } else {
        setVerification({ ...data, hasAccount: !!existingUser })
      }
    } catch (err) {
      console.error("[v0] Error loading status:", err)
      setError("An error occurred while loading your status")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    router.push(`/auth/signup?email=${encodeURIComponent(email)}`)
  }

  const getStatusColor = () => {
    switch (verification.status) {
      case "approved":
        return "from-green-500 to-emerald-500"
      case "rejected":
        return "from-red-500 to-rose-500"
      default:
        return "from-yellow-500 to-amber-500"
    }
  }

  const getStatusIcon = () => {
    switch (verification.status) {
      case "approved":
        return <CheckCircle2 className="w-12 h-12 text-green-500" />
      case "rejected":
        return <XCircle className="w-12 h-12 text-red-500" />
      default:
        return <Clock className="w-12 h-12 text-yellow-500" />
    }
  }

  if (loading) {
    return (
      <Card className="glass-strong w-full shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full blur-xl opacity-50 animate-pulse" />
              <Loader2 className="relative w-16 h-16 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Loading Dashboard...
              </h2>
              <p className="text-muted-foreground">Please wait</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-strong w-full shadow-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-destructive/20 backdrop-blur-xl flex items-center justify-center">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Error</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!verification) {
    return null
  }

  return (
    <div className="space-y-4 w-full">
      <Card className="glass-strong w-full shadow-2xl border-2">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <CardTitle className="text-2xl bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Verification Dashboard
            </CardTitle>
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <CardDescription>View your verification status and details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative animate-in zoom-in duration-500">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${getStatusColor()} rounded-full blur-2xl opacity-30 animate-pulse`}
              />
              <div className="relative w-24 h-24 rounded-full glass flex items-center justify-center border-2">
                {getStatusIcon()}
              </div>
            </div>
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
              <h2 className={`text-3xl font-bold bg-gradient-to-r ${getStatusColor()} bg-clip-text text-transparent`}>
                {verification.status === "approved" && "Approved!"}
                {verification.status === "rejected" && "Rejected"}
                {verification.status === "pending" && "Pending Review"}
              </h2>
              <p className="text-muted-foreground text-balance">
                {verification.status === "approved" && "Your verification has been approved"}
                {verification.status === "rejected" &&
                  (verification.rejection_reason || "Your verification was not approved")}
                {verification.status === "pending" &&
                  "Your verification is being reviewed. You will be notified in person at school when approved."}
              </p>
            </div>
          </div>

          {/* User Details Section */}
          <div className="glass space-y-3 pt-4 p-4 rounded-2xl">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Submission Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium ml-auto">{verification.full_name}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium ml-auto">{verification.email}</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">Date of Birth:</span>
                <span className="text-sm font-medium ml-auto">
                  {new Date(verification.date_of_birth).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-muted-foreground">Submitted:</span>
                <span className="text-sm font-medium ml-auto">
                  {new Date(verification.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Create Account Button for Approved Verifications */}
          {verification.status === "approved" && !verification.hasAccount && (
            <div className="pt-4 space-y-3">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium text-center">
                  Your verification has been approved! Create your account to access the proxy.
                </p>
              </div>
              <Button
                onClick={handleCreateAccount}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                size="lg"
              >
                Create Account
              </Button>
            </div>
          )}

          {verification.status === "approved" && verification.hasAccount && (
            <div className="pt-4">
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium text-center">
                  Account already created! You can sign in to access the proxy.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
