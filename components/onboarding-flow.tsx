"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Palette } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface OnboardingFlowProps {
  user: any
  onComplete: () => void
}

export default function OnboardingFlow({ user, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<"welcome" | "theme" | "complete">("welcome")
  const [selectedTheme, setSelectedTheme] = useState("liquid-glass")
  const firstName = user.full_name?.split(" ")[0] || user.email?.split("@")[0] || "User"

  const handleThemeSelect = async (theme: string) => {
    setSelectedTheme(theme)
    const supabase = createClient()

    await supabase
      .from("users")
      .update({
        theme,
        has_completed_onboarding: true,
      })
      .eq("id", user.id)

    setStep("complete")

    setTimeout(() => {
      onComplete()
    }, 2000)
  }

  if (step === "welcome") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift">
        <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl bg-card/95 animate-in fade-in zoom-in duration-700">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-float">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Hello, {firstName}!
            </h1>
            <p className="text-muted-foreground text-lg">Let's customize your experience</p>
          </div>
          <Button
            onClick={() => setStep("theme")}
            className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white text-lg"
          >
            Get Started
          </Button>
        </Card>
      </div>
    )
  }

  if (step === "theme") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift">
        <Card className="max-w-2xl w-full p-8 space-y-6 shadow-2xl bg-card/95 animate-in fade-in zoom-in duration-700">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Palette className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold">Choose Your Theme</h2>
            <p className="text-muted-foreground">Select the look that suits you best</p>
          </div>

          <div className="grid gap-4">
            {/* Liquid Glass Theme */}
            <button
              onClick={() => handleThemeSelect("liquid-glass")}
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift" />
              <div className="relative p-6 space-y-2">
                <h3 className="text-xl font-semibold text-left">Liquid Glass</h3>
                <p className="text-sm text-muted-foreground text-left">
                  Vibrant animated gradients with a modern glassmorphism design
                </p>
              </div>
            </button>

            {/* Dark Theme */}
            <button
              onClick={() => handleThemeSelect("dark")}
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
              <div className="relative p-6 space-y-2">
                <h3 className="text-xl font-semibold text-left text-white">Dark</h3>
                <p className="text-sm text-gray-300 text-left">
                  Sleek dark gray background with high contrast for comfortable viewing
                </p>
              </div>
            </button>

            {/* Light Theme */}
            <button
              onClick={() => handleThemeSelect("light")}
              className="group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white" />
              <div className="relative p-6 space-y-2">
                <h3 className="text-xl font-semibold text-left text-gray-900">Light</h3>
                <p className="text-sm text-gray-600 text-left">
                  Clean light background with crisp text for maximum clarity
                </p>
              </div>
            </button>
          </div>
        </Card>
      </div>
    )
  }

  // Complete step
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl bg-card/95 animate-in fade-in zoom-in duration-700">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          Welcome to Festive Park Proxy!
        </h1>
      </Card>
    </div>
  )
}
