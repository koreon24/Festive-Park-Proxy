"use client"

export default function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift">
      <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
          <div
            className="absolute inset-2 rounded-full border-4 border-transparent border-t-secondary animate-spin animation-delay-150"
            style={{ animationDirection: "reverse", animationDuration: "1s" }}
          />
        </div>
        {message && (
          <p className="text-lg font-medium bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
