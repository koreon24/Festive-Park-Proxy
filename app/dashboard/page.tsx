import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Clock } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect("/auth/login")
  }

  const { data: verification, error: dbError } = await supabase
    .from("verifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (dbError && dbError.code !== "PGRST116") {
    console.error("[v0] Error fetching verification:", dbError)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Verification Status</h1>
          <p className="text-muted-foreground">Your verification approval status</p>
        </div>

        {!verification ? (
          <Card className="p-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">No verification found for your account</p>
              <p className="text-sm text-muted-foreground">Please complete the verification process first</p>
            </div>
          </Card>
        ) : (
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {verification.status === "approved" && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Approved</h3>
                      <p className="text-sm text-muted-foreground">Your verification has been approved</p>
                    </div>
                  </>
                )}
                {verification.status === "rejected" && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Rejected</h3>
                      <p className="text-sm text-muted-foreground">
                        {verification.rejection_reason || "Your verification was not approved"}
                      </p>
                    </div>
                  </>
                )}
                {verification.status === "pending" && (
                  <>
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Pending Review</h3>
                      <p className="text-sm text-muted-foreground">Your verification is being reviewed</p>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{verification.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{verification.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted:</span>
                  <span className="font-medium">{new Date(verification.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
