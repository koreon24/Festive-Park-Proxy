"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubmissionScreenProps {
  userInfo: {
    email: string
    fullName: string
    dateOfBirth: string
  }
  idFrontImage: string
  idBackImage: string
  faceCenterImage: string
  faceLeftImage: string
  faceRightImage: string
  onBack: () => void
  onSubmissionComplete: () => void
}

export default function SubmissionScreen({
  userInfo,
  idFrontImage,
  idBackImage,
  faceCenterImage,
  faceLeftImage,
  faceRightImage,
  onBack,
  onSubmissionComplete,
}: SubmissionScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<string>("Uploading images...")
  const router = useRouter()

  useEffect(() => {
    handleSubmit()
  }, [])

  const uploadImageToBlob = async (base64Image: string, filename: string): Promise<string> => {
    const response = await fetch(base64Image)
    const blob = await response.blob()
    const file = new File([blob], filename, { type: blob.type })
    const formData = new FormData()
    formData.append("file", file)

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      throw new Error(errorData.error || "Failed to upload image")
    }

    const data = await uploadResponse.json()
    return data.url
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      setCurrentStep("Uploading images...")

      const [idFrontUrl, idBackUrl, faceCenterUrl, faceLeftUrl, faceRightUrl] = await Promise.all([
        uploadImageToBlob(idFrontImage, "id-front.jpg"),
        uploadImageToBlob(idBackImage, "id-back.jpg"),
        uploadImageToBlob(faceCenterImage, "face-center.jpg"),
        uploadImageToBlob(faceLeftImage, "face-left.jpg"),
        uploadImageToBlob(faceRightImage, "face-right.jpg"),
      ])

      setCurrentStep("Submitting verification...")
      const requestData = {
        ...userInfo,
        idFrontUrl,
        idBackUrl,
        faceCenterUrl,
        faceLeftUrl,
        faceRightUrl,
      }

      const response = await fetch("/api/submit-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || "Failed to submit verification")
      }

      setCurrentStep("Complete!")
      setTimeout(() => {
        router.push(`/check-status?email=${encodeURIComponent(userInfo.email)}`)
      }, 1000)
    } catch (error) {
      console.error("[v0] Submission error:", error)
      setError(error instanceof Error ? error.message : "Submission failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  if (error) {
    return (
      <Card className="p-8 bg-card border-border">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">Submission Failed</h2>
            <p className="text-muted-foreground text-balance">{error}</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-8 bg-card border-border">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 flex items-center justify-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{currentStep}</h2>
          <p className="text-muted-foreground text-balance">Please wait while we process your information.</p>
        </div>
      </div>
    </Card>
  )
}
