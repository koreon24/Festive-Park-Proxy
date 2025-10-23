"use client"

import { useState, useEffect } from "react"
import WelcomeScreen from "./welcome-screen"
import UserInfoScreen from "./user-info-screen"
import IdCaptureScreen from "./id-capture-screen"
import FaceCaptureScreen from "./face-capture-screen"
import SubmissionScreen from "./submission-screen"
import DashboardScreen from "./dashboard-screen"
import DesktopQRScreen from "./desktop-qr-screen"
import { useIsMobile } from "@/hooks/use-mobile"

export type VerificationStep = "welcome" | "user-info" | "id-front" | "id-back" | "face-capture" | "submission"

export default function VerificationFlow() {
  const [step, setStep] = useState<VerificationStep>("welcome")
  const [userInfo, setUserInfo] = useState<{
    email: string
    fullName: string
    dateOfBirth: string
  } | null>(null)
  const [idFrontImage, setIdFrontImage] = useState<string | null>(null)
  const [idBackImage, setIdBackImage] = useState<string | null>(null)
  const [faceImages, setFaceImages] = useState<{
    center: string | null
    left: string | null
    right: string | null
  }>({
    center: null,
    left: null,
    right: null,
  })
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    const submitted = localStorage.getItem("verification_submitted")
    const email = localStorage.getItem("verification_email")
    if (submitted === "true") {
      setHasSubmitted(true)
      setSubmittedEmail(email)
    }
  }, [])

  const handleSubmissionComplete = () => {
    localStorage.setItem("verification_submitted", "true")
    if (userInfo?.email) {
      localStorage.setItem("verification_email", userInfo.email)
      setSubmittedEmail(userInfo.email)
    }
    setHasSubmitted(true)
  }

  const handleReset = () => {
    localStorage.removeItem("verification_submitted")
    localStorage.removeItem("verification_email")
    setHasSubmitted(false)
    setSubmittedEmail(null)
  }

  if (!isMobile) {
    return <DesktopQRScreen />
  }

  if (hasSubmitted && submittedEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <DashboardScreen email={submittedEmail} onReset={handleReset} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === "welcome" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <WelcomeScreen onNext={() => setStep("user-info")} />
          </div>
        )}
        {step === "user-info" && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <UserInfoScreen
              onNext={(email, fullName, dateOfBirth) => {
                setUserInfo({ email, fullName, dateOfBirth })
                setStep("id-front")
              }}
              onBack={() => setStep("welcome")}
            />
          </div>
        )}
        {step === "id-front" && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <IdCaptureScreen
              side="front"
              onNext={(image) => {
                setIdFrontImage(image)
                setStep("id-back")
              }}
              onBack={() => setStep("user-info")}
            />
          </div>
        )}
        {step === "id-back" && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <IdCaptureScreen
              side="back"
              onNext={(image) => {
                setIdBackImage(image)
                setStep("face-capture")
              }}
              onBack={() => setStep("id-front")}
            />
          </div>
        )}
        {step === "face-capture" && (
          <div className="animate-in fade-in slide-in-from-right duration-500">
            <FaceCaptureScreen
              onNext={(centerImage, leftImage, rightImage) => {
                setFaceImages({ center: centerImage, left: leftImage, right: rightImage })
                setStep("submission")
              }}
              onBack={() => setStep("id-back")}
            />
          </div>
        )}
        {step === "submission" &&
          userInfo &&
          idFrontImage &&
          idBackImage &&
          faceImages.center &&
          faceImages.left &&
          faceImages.right && (
            <div className="animate-in fade-in slide-in-from-right duration-500">
              <SubmissionScreen
                userInfo={userInfo}
                idFrontImage={idFrontImage}
                idBackImage={idBackImage}
                faceCenterImage={faceImages.center}
                faceLeftImage={faceImages.left}
                faceRightImage={faceImages.right}
                onBack={() => setStep("face-capture")}
                onSubmissionComplete={handleSubmissionComplete}
              />
            </div>
          )}
      </div>
    </div>
  )
}
