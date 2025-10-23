"use client"

import { Card } from "@/components/ui/card"
import { Smartphone } from "lucide-react"
import Image from "next/image"

export default function DesktopQRScreen() {
  const url = "https://festiveparkwithlucen.vercel.app"
  // Using QR code API to generate QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-12 bg-card border-border max-w-2xl w-full">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
            <Smartphone className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-foreground">Mobile Device Required</h1>
            <p className="text-lg text-muted-foreground text-balance">
              Scan the QR code below with your mobile device to continue
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <Image
              src={qrCodeUrl || "/placeholder.svg"}
              alt="QR Code"
              width={400}
              height={400}
              className="w-full h-auto"
              unoptimized
            />
          </div>

          <p className="text-xl font-medium text-foreground pt-4">{"\n"}</p>
        </div>
      </Card>
    </div>
  )
}
