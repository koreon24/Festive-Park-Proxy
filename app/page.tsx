"use client"
import { Card } from "@/components/ui/card"
import { Shield, Search, Sparkles, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient" />
      <div className="absolute inset-0 animate-shimmer" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-4 animate-float">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Powered by the Festive Park Team
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-1000">
              Festive Park
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure verification and private search engine in one beautiful platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Verification Card */}
            <Link href="/verify" className="group">
              <Card className="glass-strong p-8 h-full hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/50 shadow-xl hover:shadow-2xl animate-liquid-glass">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold">Get Verified</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      New user? Submit your school ID for verification to gain access to Festive Park proxy.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                    Start Verification
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>

            {/* Homework Card */}
            <Link href="/auth/homework-login" className="group">
              <Card className="glass-strong p-8 h-full hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-accent/50 shadow-xl hover:shadow-2xl animate-liquid-glass">
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 px-2 py-1 text-xs font-bold bg-primary text-primary-foreground rounded-full">
                      BETA
                    </span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold">AI Homework Help</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Get help understanding your homework. AI explains concepts without giving answers.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-4 transition-all">
                    Get Help
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>

            {/* Proxy Card */}
            <Link href="/auth/login" className="group">
              <Card className="glass-strong p-8 h-full hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-secondary/50 shadow-xl hover:shadow-2xl animate-liquid-glass">
                <div className="space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold">Access Proxy</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Already verified? Sign in to access the Festive Park private search engine.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-secondary font-medium group-hover:gap-4 transition-all">
                    Sign In
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
