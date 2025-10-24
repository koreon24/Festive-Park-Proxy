"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sparkles, Settings, LogOut, Loader2, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface ProxySearchProps {
  user: any
}

export default function ProxySearch({ user }: ProxySearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [greeting, setGreeting] = useState("")
  const [userName, setUserName] = useState("")
  const [theme, setTheme] = useState("liquid-glass")
  const [backgroundUrl, setBackgroundUrl] = useState("")
  const [proxyUrl, setProxyUrl] = useState("")
  const [showProxy, setShowProxy] = useState(false)

  useEffect(() => {
    const getGreeting = () => {
      const estTime = new Date().toLocaleString("en-US", { timeZone: "America/New_York" })
      const hour = new Date(estTime).getHours()

      if (hour < 12) return "Good Morning"
      if (hour < 18) return "Good Afternoon"
      return "Good Evening"
    }

    setGreeting(getGreeting())

    const name = user.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User"
    setUserName(name)

    // Load user theme and background
    setTheme(user.theme || "liquid-glass")
    setBackgroundUrl(user.background || "")
  }, [user])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const trimmedQuery = query.trim()

      // Check if it's a URL
      const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(trimmedQuery)

      if (isUrl) {
        const url = trimmedQuery.startsWith("http") ? trimmedQuery : `https://${trimmedQuery}`
        const proxyPath = `/api/proxy?url=${encodeURIComponent(url)}`
        setProxyUrl(proxyPath)
        setShowProxy(true)
      } else {
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(trimmedQuery)}`
        const proxyPath = `/api/proxy?url=${encodeURIComponent(searchUrl)}`
        setProxyUrl(proxyPath)
        setShowProxy(true)
      }

      const supabase = createClient()
      if (user?.id) {
        supabase
          .from("search_history")
          .insert({
            user_id: user.id,
            query: trimmedQuery,
          })
          .then(({ error }) => {
            if (error) console.error("[v0] Failed to save search history:", error)
          })
      }

      setQuery("")
    } catch (err) {
      console.error("[v0] Search error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  const getBackgroundClass = () => {
    if (backgroundUrl) return ""

    switch (theme) {
      case "dark":
        return "bg-gradient-to-br from-gray-900 to-gray-800"
      case "light":
        return "bg-gradient-to-br from-gray-50 to-white"
      default: // liquid-glass
        return "bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift"
    }
  }

  if (showProxy) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="bg-card border-b p-2 flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowProxy(false)}>
            ← Back to Search
          </Button>
          <div className="flex-1 text-sm text-muted-foreground truncate">{proxyUrl}</div>
        </div>
        <iframe
          src={proxyUrl}
          className="flex-1 w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    )
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${getBackgroundClass()}`} data-theme={theme}>
      {backgroundUrl && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }} />
      )}

      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="max-w-6xl mx-auto py-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <Card className="p-6 shadow-2xl bg-card/90">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-float">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                    Festive Park
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {greeting}, {userName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/settings">
                  <Button variant="outline" size="icon">
                    <Settings className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Section */}
        <div className="max-w-4xl mx-auto space-y-8 py-12">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
              Private Search
            </h2>
            <p className="text-xl text-muted-foreground">Search the web or enter a URL to visit</p>
          </div>

          <form onSubmit={handleSearch} className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
            <Card className="p-4 shadow-2xl bg-card/90">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter URL or search query..."
                    className="pl-12 h-14 text-lg border-0 bg-transparent"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Go"}
                </Button>
              </div>
            </Card>
          </form>

          <Card className="p-6 shadow-xl bg-card/90 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary animate-float" />
                How to use Festive Park Proxy
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Enter a website URL (e.g., example.com or https://example.com) to visit it directly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Type keywords or questions to search the web privately using DuckDuckGo</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>All searches are private and secure - your activity is not tracked</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
