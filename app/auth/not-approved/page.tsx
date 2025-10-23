"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Clock } from "lucide-react"
import Link from "next/link"

export default function NotApprovedPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="glass-strong shadow-2xl">
          <CardHeader className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Verification Pending</CardTitle>
            <CardDescription className="text-base">
              Your account is awaiting admin approval. You'll receive access once your verification is reviewed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg glass border border-border/50">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">What happens next?</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Our admin team will review your verification submission. Once approved, you'll be able to sign in
                    and access the Festive Park proxy.
                  </p>
                </div>
              </div>
            </div>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full glass bg-transparent">
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
