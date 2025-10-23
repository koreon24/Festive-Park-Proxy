import VerificationFlow from "@/components/verification-flow"

export default function VerifyPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="relative z-10">
        <VerificationFlow />
      </div>
    </main>
  )
}
