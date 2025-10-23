"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle2, XCircle, Clock, Loader2, ExternalLink, Shield, Users, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { isAdminEmail } from "@/lib/admin"

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const [verifications, setVerifications] = useState<any[]>([])
  const [proxyUsers, setProxyUsers] = useState<any[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [rejectionReason, setRejectionReason] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/admin-login")
        return
      }

      const email = user.email?.toLowerCase() || ""
      setUserEmail(email)

      if (!isAdminEmail(email)) {
        setIsAuthenticated(true)
        setIsAdmin(false)
        setLoading(false)
        return
      }

      setIsAuthenticated(true)
      setIsAdmin(true)
      setLoading(false)
    } catch (err) {
      console.error("[v0] Auth check error:", err)
      router.push("/auth/admin-login")
    }
  }

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadVerifications()
      loadProxyUsers()
      loadSearchHistory()
    }
  }, [filter, isAuthenticated, isAdmin])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/auth/admin-login")
  }

  const updateStatus = async (id: string, status: "approved" | "rejected", reason?: string) => {
    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("verifications")
        .update({
          status,
          rejection_reason: status === "rejected" ? reason || null : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      loadVerifications()
      loadProxyUsers()
    } catch (err) {
      console.error("[v0] Error updating status:", err)
      alert("Error: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  const loadVerifications = async () => {
    setLoading(true)
    try {
      const supabase = createClient()
      let query = supabase.from("verifications").select("*").order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (error) throw error
      setVerifications(data || [])
    } catch (err) {
      console.error("[v0] Error loading verifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadProxyUsers = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProxyUsers(data || [])
    } catch (err) {
      console.error("[v0] Error loading proxy users:", err)
    }
  }

  const loadSearchHistory = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("search_history")
        .select("*, users(full_name, email)")
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) throw error
      setSearchHistory(data || [])
    } catch (err) {
      console.error("[v0] Error loading search history:", err)
    }
  }

  const toggleUserActive = async (userId: string, currentStatus: boolean) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("users").update({ is_active: !currentStatus }).eq("id", userId)

      if (error) throw error
      loadProxyUsers()
    } catch (err) {
      console.error("[v0] Error toggling user status:", err)
    }
  }

  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass-strong w-full max-w-md p-8 space-y-6 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-rose-500 bg-clip-text text-transparent">
            Unauthorized
          </h1>
          <p className="text-muted-foreground">Your account ({userEmail}) does not have admin access.</p>
          <Button onClick={handleLogout} variant="outline" className="w-full glass bg-transparent">
            Logout
          </Button>
        </Card>
      </div>
    )
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

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="glass-strong p-6 rounded-3xl shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex-1 text-center space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-muted-foreground">Manage verifications and proxy users</p>
            </div>
            <div className="flex-1 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleLogout} className="glass bg-transparent">
                Logout
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="verifications" className="space-y-6">
          <TabsList className="glass-strong p-1">
            <TabsTrigger
              value="verifications"
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              Verifications
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Proxy Users
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-accent data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              Search History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-4">
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={filter === "all" ? "bg-gradient-to-r from-primary to-secondary text-white" : "glass"}
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className={filter === "pending" ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white" : "glass"}
              >
                Pending
              </Button>
              <Button
                variant={filter === "approved" ? "default" : "outline"}
                onClick={() => setFilter("approved")}
                className={
                  filter === "approved" ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white" : "glass"
                }
              >
                Approved
              </Button>
              <Button
                variant={filter === "rejected" ? "default" : "outline"}
                onClick={() => setFilter("rejected")}
                className={filter === "rejected" ? "bg-gradient-to-r from-red-500 to-rose-500 text-white" : "glass"}
              >
                Rejected
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : verifications.length === 0 ? (
              <Card className="glass-strong p-12 text-center shadow-xl">
                <p className="text-muted-foreground">No verifications found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {verifications.map((verification) => (
                  <Card key={verification.id} className="glass-strong p-6 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="font-bold text-lg">{verification.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{verification.email}</p>
                          <p className="text-sm text-muted-foreground">DOB: {verification.date_of_birth}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {new Date(verification.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {verification.status === "approved" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                          {verification.status === "rejected" && <XCircle className="w-5 h-5 text-red-500" />}
                          {verification.status === "pending" && <Clock className="w-5 h-5 text-yellow-500" />}
                          <span className="text-sm font-medium capitalize">{verification.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <a
                          href={verification.id_front_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          ID Front <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={verification.id_back_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          ID Back <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={verification.face_images_urls.center}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Face Center <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={verification.face_images_urls.left}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Face Left <ExternalLink className="w-3 h-3" />
                        </a>
                        <a
                          href={verification.face_images_urls.right}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          Face Right <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      {verification.status === "pending" && (
                        <div className="space-y-3 pt-4 border-t">
                          <Textarea
                            placeholder="Rejection reason (optional)"
                            value={rejectionReason[verification.id] || ""}
                            onChange={(e) =>
                              setRejectionReason({ ...rejectionReason, [verification.id]: e.target.value })
                            }
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateStatus(verification.id, "approved")}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() =>
                                updateStatus(verification.id, "rejected", rejectionReason[verification.id])
                              }
                              variant="destructive"
                              className="flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {verification.status === "rejected" && verification.rejection_reason && (
                        <div className="pt-4 border-t">
                          <p className="text-sm text-muted-foreground">
                            <strong>Rejection Reason:</strong> {verification.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            {proxyUsers.length === 0 ? (
              <Card className="glass-strong p-12 text-center shadow-xl">
                <p className="text-muted-foreground">No proxy users found</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {proxyUsers.map((user) => (
                  <Card key={user.id} className="glass-strong p-6 shadow-xl hover:shadow-2xl transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-bold text-lg">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </p>
                        {user.last_login && (
                          <p className="text-xs text-muted-foreground">
                            Last login: {new Date(user.last_login).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.is_active ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </div>
                        <Button
                          onClick={() => toggleUserActive(user.id, user.is_active)}
                          variant={user.is_active ? "destructive" : "default"}
                          size="sm"
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {searchHistory.length === 0 ? (
              <Card className="glass-strong p-12 text-center shadow-xl">
                <p className="text-muted-foreground">No search history found</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((search) => (
                  <Card key={search.id} className="glass-strong p-4 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{search.query}</p>
                        <p className="text-sm text-muted-foreground">
                          {search.users?.full_name} ({search.users?.email})
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(search.created_at).toLocaleString()}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
