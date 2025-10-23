"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"

interface UserInfoScreenProps {
  onNext: (email: string, fullName: string, dateOfBirth: string) => void
  onBack: () => void
}

export default function UserInfoScreen({ onNext, onBack }: UserInfoScreenProps) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [errors, setErrors] = useState<{ email?: string; fullName?: string; dateOfBirth?: string }>({})

  const validateForm = () => {
    const newErrors: { email?: string; fullName?: string; dateOfBirth?: string } = {}

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!fullName || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name"
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = "Please enter your date of birth"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onNext(email, fullName, dateOfBirth)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Your Information</h2>
          <p className="text-muted-foreground">Please provide your details to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className={errors.dateOfBirth ? "border-destructive" : ""}
            />
            {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
          </div>

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </div>
    </Card>
  )
}
