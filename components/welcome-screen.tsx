"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShieldCheck, Camera, UserCheck, Sparkles } from "lucide-react"

interface WelcomeScreenProps {
  onNext: () => void
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <Card className="glass-strong p-8 border-2 shadow-2xl">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent p-[2px] animate-in zoom-in duration-700">
          <div className="w-full h-full rounded-3xl bg-background/90 backdrop-blur-xl flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Festive Park Identity
            </h1>
            <Sparkles className="w-6 h-6 text-accent animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground text-balance">Verify your identity in two simple steps</p>
        </div>

        <div className="w-full space-y-4 pt-6">
          <div className="glass flex items-start gap-4 text-left p-4 rounded-2xl animate-in slide-in-from-left duration-700 delay-200">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 shadow-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Scan your school ID</h3>
              <p className="text-sm text-muted-foreground">Take a clear photo of your student ID card</p>
            </div>
          </div>

          <div className="glass flex items-start gap-4 text-left p-4 rounded-2xl animate-in slide-in-from-right duration-700 delay-300">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center flex-shrink-0 shadow-lg">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">Verify your face</h3>
              <p className="text-sm text-muted-foreground">Take a selfie to confirm your identity</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-primary via-secondary to-accent text-white hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 animate-in fade-in duration-700 delay-400"
          size="lg"
        >
          Start Verification
        </Button>

        <p className="text-xs text-muted-foreground animate-in fade-in duration-700 delay-500">
          Your information is secure with Lucen and Festive Park. This will only be used for verification purposes to
          protect Festive Park
        </p>
      </div>
    </Card>
  )
}
