"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Check, Palette, Upload, X } from "lucide-react"
import Link from "next/link"
import { put } from "@vercel/blob"

const THEMES = [
  { id: "light", name: "Light", description: "Clean and bright" },
  { id: "dark", name: "Dark", description: "Easy on the eyes" },
  { id: "liquid-glass", name: "Liquid Glass", description: "Animated gradients" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [selectedTheme, setSelectedTheme] = useState("liquid-glass")
  const [backgroundUrl, setBackgroundUrl] = useState("")
  const [previewUrl, setPreviewUrl] = useState("")

  useEffect(() => {
    loadUserSettings()
  }, [])

  const loadUserSettings = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push("/auth/login")
        return
      }

      const { data: userData, error } = await supabase.from("users").select("*").eq("email", authUser.email).single()

      if (error || !userData) {
        router.push("/auth/login")
        return
      }

      setUser(userData)
      setSelectedTheme(userData.theme || "liquid-glass")
      setBackgroundUrl(userData.background || "")
      setPreviewUrl(userData.background || "")
      setLoading(false)
    } catch (err) {
      console.error("[v0] Error loading settings:", err)
      router.push("/auth/login")
    }
  }

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB")
      return
    }

    setUploading(true)
    try {
      // Upload to Vercel Blob
      const blob = await put(`backgrounds/${user.id}-${Date.now()}.${file.name.split(".").pop()}`, file, {
        access: "public",
      })

      setBackgroundUrl(blob.url)
      setPreviewUrl(blob.url)
    } catch (err) {
      console.error("[v0] Upload error:", err)
      alert("Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const removeBackground = () => {
    setBackgroundUrl("")
    setPreviewUrl("")
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({
          theme: selectedTheme,
          background: backgroundUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      // Reload to apply changes
      window.location.href = "/proxy"
    } catch (err) {
      console.error("[v0] Error saving settings:", err)
      alert("Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden p-4" data-theme={selectedTheme}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift" />

      <div className="relative z-10 max-w-4xl mx-auto py-8 space-y-6">
        {/* Header */}
        <Card className="p-6 shadow-2xl bg-card/90">
          <div className="flex items-center gap-4">
            <Link href="/proxy">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-muted-foreground">Customize your Festive Park experience</p>
            </div>
          </div>
        </Card>

        {/* Theme Selection */}
        <Card className="p-6 shadow-2xl space-y-6 bg-card/90">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Theme</Label>
            </div>
            <p className="text-sm text-muted-foreground">Choose your preferred theme style</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`relative p-6 rounded-2xl border-2 transition-all hover:scale-105 ${
                  selectedTheme === theme.id
                    ? "border-primary shadow-lg shadow-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/50 bg-card/50"
                }`}
              >
                {selectedTheme === theme.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-lg font-semibold">{theme.name}</p>
                  <p className="text-sm text-muted-foreground">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Background Upload */}
        <Card className="p-6 shadow-2xl space-y-6 bg-card/90">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              <Label className="text-lg font-semibold">Custom Background</Label>
            </div>
            <p className="text-sm text-muted-foreground">Upload your own background image (max 5MB)</p>
          </div>

          {previewUrl ? (
            <div className="relative">
              <div className="w-full h-48 rounded-xl overflow-hidden">
                <img
                  src={previewUrl || "/placeholder.svg"}
                  alt="Background preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <Button variant="destructive" size="icon" className="absolute top-2 right-2" onClick={removeBackground}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
                id="background-upload"
                disabled={uploading}
              />
              <label htmlFor="background-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploading ? "Uploading..." : "Click to upload background image"}
                  </p>
                </div>
              </label>
            </div>
          )}
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Link href="/proxy">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button
            onClick={saveSettings}
            disabled={saving || uploading}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
