"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, ArrowLeft, AlertCircle } from "lucide-react"

interface FaceCaptureScreenProps {
  onNext: (centerImage: string, leftImage: string, rightImage: string) => void
  onBack: () => void
}

type HeadPose = "center" | "left" | "right"

export default function FaceCaptureScreen({ onNext, onBack }: FaceCaptureScreenProps) {
  const [capturedImages, setCapturedImages] = useState<{
    center: string | null
    left: string | null
    right: string | null
  }>({
    center: null,
    left: null,
    right: null,
  })
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shouldStartCamera, setShouldStartCamera] = useState(false)
  const [currentPose, setCurrentPose] = useState<HeadPose>("center")
  const [completedPoses, setCompletedPoses] = useState<Set<HeadPose>>(new Set())
  const [poseMessage, setPoseMessage] = useState("Look straight at the camera")
  const [isDetecting, setIsDetecting] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isInitializingRef = useRef(false)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const poseStableFramesRef = useRef(0)
  const requiredStableFrames = 20
  const lastFaceCenterXRef = useRef<number | null>(null)
  const lastFaceCenterYRef = useRef<number | null>(null)
  const lastFaceSizeRef = useRef<number | null>(null)
  const phoneMovementFramesRef = useRef(0)

  useEffect(() => {
    if (shouldStartCamera && videoRef.current && !isInitializingRef.current) {
      initializeCamera()
    }
  }, [shouldStartCamera])

  useEffect(() => {
    if (isDetecting && videoRef.current) {
      detectionIntervalRef.current = setInterval(() => {
        if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          detectHeadPose()
        }
      }, 300)
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [isDetecting, currentPose, completedPoses])

  const detectHeadPose = () => {
    if (!videoRef.current) return

    const canvas = document.createElement("canvas")
    const scale = 0.5
    canvas.width = videoRef.current.videoWidth * scale
    canvas.height = videoRef.current.videoHeight * scale
    const ctx = canvas.getContext("2d", { willReadFrequently: true })

    if (!ctx) return

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    const width = canvas.width
    const height = canvas.height

    const centerX = width / 2
    const centerY = height / 2
    const faceRegionWidth = width * 0.4
    const faceRegionHeight = height * 0.5
    const faceLeft = centerX - faceRegionWidth / 2
    const faceRight = centerX + faceRegionWidth / 2
    const faceTop = centerY - faceRegionHeight / 2
    const faceBottom = centerY + faceRegionHeight / 2

    let faceBrightness = 0
    let totalFacePixels = 0
    let faceMassX = 0
    let faceMassY = 0
    let brightPixelCount = 0

    for (let y = faceTop; y < faceBottom; y += 4) {
      for (let x = faceLeft; x < faceRight; x += 4) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const brightness = (r + g + b) / 3

        faceBrightness += brightness
        totalFacePixels++

        if (brightness > 100) {
          faceMassX += x
          faceMassY += y
          brightPixelCount++
        }
      }
    }

    const avgFaceBrightness = faceBrightness / totalFacePixels

    console.log("[v0] Face brightness:", avgFaceBrightness.toFixed(1), "bright pixels:", brightPixelCount)

    if (avgFaceBrightness < 15 || avgFaceBrightness > 250) {
      poseStableFramesRef.current = 0
      setPoseMessage("Position your face in the frame")
      setShowCountdown(false)
      return
    }

    if (brightPixelCount < 5) {
      poseStableFramesRef.current = 0
      setPoseMessage("Position your face in the frame")
      setShowCountdown(false)
      return
    }

    if (brightPixelCount === 0) {
      poseStableFramesRef.current = 0
      setPoseMessage("Position your face in the frame")
      setShowCountdown(false)
      return
    }

    if (lastFaceCenterXRef.current !== null && lastFaceSizeRef.current !== null) {
      const centerXDiff = Math.abs(faceMassX / brightPixelCount - lastFaceCenterXRef.current)
      const centerYDiff = Math.abs(faceMassY / brightPixelCount - lastFaceCenterYRef.current!)
      const sizeDiff = Math.abs(brightPixelCount - lastFaceSizeRef.current) / lastFaceSizeRef.current

      if (centerXDiff > width * 0.4 || centerYDiff > height * 0.4 || sizeDiff > 0.6) {
        phoneMovementFramesRef.current++

        if (phoneMovementFramesRef.current >= 4) {
          poseStableFramesRef.current = 0
          setPoseMessage("Keep your phone steady")
          setShowCountdown(false)
        }

        lastFaceCenterXRef.current = faceMassX / brightPixelCount
        lastFaceCenterYRef.current = faceMassY / brightPixelCount
        lastFaceSizeRef.current = brightPixelCount
        return
      } else {
        phoneMovementFramesRef.current = 0
      }
    }

    lastFaceCenterXRef.current = faceMassX / brightPixelCount
    lastFaceCenterYRef.current = faceMassY / brightPixelCount
    lastFaceSizeRef.current = brightPixelCount

    const thirdWidth = width / 3
    let leftBrightness = 0
    let centerBrightness = 0
    let rightBrightness = 0
    let leftPixels = 0
    let centerPixels = 0
    let rightPixels = 0

    const checkTop = height * 0.3
    const checkBottom = height * 0.7

    for (let y = checkTop; y < checkBottom; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const brightness = (r + g + b) / 3

        if (x < thirdWidth) {
          leftBrightness += brightness
          leftPixels++
        } else if (x < thirdWidth * 2) {
          centerBrightness += brightness
          centerPixels++
        } else {
          rightBrightness += brightness
          rightPixels++
        }
      }
    }

    const avgLeft = leftBrightness / leftPixels
    const avgCenter = centerBrightness / centerPixels
    const avgRight = rightBrightness / rightPixels

    let detectedPose: HeadPose = "center"

    const leftRightDiff = Math.abs(avgLeft - avgRight)

    if (avgLeft > avgRight + 15) {
      detectedPose = "right" // Left side brighter = user turned right
    } else if (avgRight > avgLeft + 15) {
      detectedPose = "left" // Right side brighter = user turned left
    } else {
      detectedPose = "center"
    }

    console.log("[v0] Detection:", {
      avgLeft: avgLeft.toFixed(1),
      avgCenter: avgCenter.toFixed(1),
      avgRight: avgRight.toFixed(1),
      leftRightDiff: leftRightDiff.toFixed(1),
      detectedPose,
      nextNeeded: getNextPoseNeeded(),
      stableFrames: poseStableFramesRef.current,
    })

    const nextPoseNeeded = getNextPoseNeeded()

    if (detectedPose === nextPoseNeeded) {
      poseStableFramesRef.current++

      if (poseStableFramesRef.current >= requiredStableFrames) {
        capturePosePhoto(detectedPose)
        poseStableFramesRef.current = 0
        setShowCountdown(false)

        const newCompleted = new Set(completedPoses)
        newCompleted.add(detectedPose)
        setCompletedPoses(newCompleted)

        if (newCompleted.size === 3) {
          setPoseMessage("Perfect! Submitting...")
          setIsDetecting(false)
        } else {
          const next = getNextPoseNeeded(newCompleted)
          setCurrentPose(next)
          updatePoseMessage(next, newCompleted)
        }
      } else {
        if (poseStableFramesRef.current >= 3) {
          const progress = (poseStableFramesRef.current - 3) / (requiredStableFrames - 3)
          let countdown = "3"
          if (progress >= 0.66) {
            countdown = "1"
          } else if (progress >= 0.33) {
            countdown = "2"
          }
          setPoseMessage(countdown)
          setShowCountdown(true)
        } else {
          setShowCountdown(false)
        }
      }
    } else {
      poseStableFramesRef.current = 0
      setShowCountdown(false)
      updatePoseMessage(nextPoseNeeded, completedPoses)
    }
  }

  const getNextPoseNeeded = (completed: Set<HeadPose> = completedPoses): HeadPose => {
    if (!completed.has("center")) return "center"
    if (!completed.has("left")) return "left"
    if (!completed.has("right")) return "right"
    return "center"
  }

  const updatePoseMessage = (pose: HeadPose, completed: Set<HeadPose>) => {
    const messages = {
      center: "Look straight at the camera",
      left: "Turn your head to the left",
      right: "Turn your head to the right",
    }
    setPoseMessage(messages[pose])
  }

  const initializeCamera = async () => {
    console.log("[v0] Initializing face camera...")

    if (!window.isSecureContext) {
      setError(
        "Camera requires HTTPS or localhost. Your app is running on an insecure connection. Please access via HTTPS/localhost.",
      )
      setShouldStartCamera(false)
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not available in this browser.")
      setShouldStartCamera(false)
      return
    }

    if (!videoRef.current) {
      setError("Video element not ready. Please try again.")
      setShouldStartCamera(false)
      return
    }

    isInitializingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Requesting camera access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      })

      console.log("[v0] Camera access granted")

      if (videoRef.current && stream) {
        streamRef.current = stream
        videoRef.current.srcObject = stream

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video ref lost"))
            return
          }

          videoRef.current.onloadedmetadata = () => {
            console.log("[v0] Video metadata loaded")
            videoRef.current
              ?.play()
              .then(() => {
                console.log("[v0] Video playing")
                setIsDetecting(true)
                setCurrentPose("center")
                setPoseMessage("Look straight at the camera")
                resolve()
              })
              .catch((err) => {
                console.error("[v0] Video play error:", err)
                reject(err)
              })
          }

          videoRef.current.onerror = (err) => {
            console.error("[v0] Video error:", err)
            reject(err)
          }
        })
      } else {
        throw new Error("Video element not available")
      }
    } catch (error: any) {
      console.error("[v0] Camera initialization error:", error)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setError(
          "Camera permission denied. Please allow camera access when prompted. On mobile, check your browser settings: Settings > Site Settings > Camera.",
        )
      } else if (error.name === "NotFoundError") {
        setError("No camera found on your device.")
      } else if (error.name === "NotReadableError") {
        setError("Camera is in use by another app. Please close other apps and try again.")
      } else {
        setError(`Unable to access camera: ${error.message}. Please check your permissions.`)
      }

      setIsCapturing(false)
      setShouldStartCamera(false)
    } finally {
      setIsLoading(false)
      isInitializingRef.current = false
    }
  }

  const startCamera = () => {
    console.log("[v0] Starting face camera")
    setCompletedPoses(new Set())
    setCurrentPose("center")
    poseStableFramesRef.current = 0
    setCapturedImages({ center: null, left: null, right: null })
    lastFaceCenterXRef.current = null
    lastFaceCenterYRef.current = null
    lastFaceSizeRef.current = null
    setShowCountdown(false)
    setIsCapturing(true)
    setShouldStartCamera(true)
  }

  const capturePosePhoto = (pose: HeadPose) => {
    console.log("[v0] Capturing photo for pose:", pose)
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.7)
        setCapturedImages((prev) => ({
          ...prev,
          [pose]: imageData,
        }))
        console.log("[v0] ✓ Photo captured for", pose)
      }
    }
  }

  const stopCamera = () => {
    console.log("[v0] Stopping face camera")
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
    setIsDetecting(false)
    setIsCapturing(false)
    setShouldStartCamera(false)
    isInitializingRef.current = false
  }

  const retake = () => {
    setCapturedImages({ center: null, left: null, right: null })
    setError(null)
    setCompletedPoses(new Set())
    setCurrentPose("center")
    poseStableFramesRef.current = 0
    lastFaceCenterXRef.current = null
    lastFaceCenterYRef.current = null
    lastFaceSizeRef.current = null
    phoneMovementFramesRef.current = 0
    setShowCountdown(false)
    startCamera()
  }

  useEffect(() => {
    if (capturedImages.center && capturedImages.left && capturedImages.right && completedPoses.size === 3) {
      console.log("[v0] All poses captured, auto-submitting...")
      setTimeout(() => {
        stopCamera()
        onNext(capturedImages.center!, capturedImages.left!, capturedImages.right!)
      }, 1500)
    }
  }, [capturedImages, completedPoses])

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">3</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">Verify Your Face</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Follow the instructions on screen</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${completedPoses.has("center") ? "bg-primary" : "bg-muted"}`} />
            <span className="text-sm text-muted-foreground">Center</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${completedPoses.has("left") ? "bg-primary" : "bg-muted"}`} />
            <span className="text-sm text-muted-foreground">Left</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${completedPoses.has("right") ? "bg-primary" : "bg-muted"}`} />
            <span className="text-sm text-muted-foreground">Right</span>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden">
          {!isCapturing && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-muted-foreground/30 mx-auto flex items-center justify-center">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Position your face in the frame</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Starting camera...</p>
              </div>
            </div>
          )}

          {isCapturing && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
                style={{
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
              />

              {isDetecting && (
                <>
                  {!showCountdown && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative" style={{ perspective: "1000px" }}>
                        <style jsx>{`
                          @keyframes turnLeft {
                            0%,
                            100% {
                              transform: rotateY(0deg);
                            }
                            50% {
                              transform: rotateY(-50deg);
                            }
                          }
                          @keyframes turnRight {
                            0%,
                            100% {
                              transform: rotateY(0deg);
                            }
                            50% {
                              transform: rotateY(50deg);
                            }
                          }
                          @keyframes lookCenter {
                            0%,
                            100% {
                              transform: rotateY(0deg) scale(1);
                            }
                            50% {
                              transform: rotateY(0deg) scale(1.05);
                            }
                          }
                          .animate-turn-left {
                            animation: turnLeft 1.5s ease-in-out infinite;
                          }
                          .animate-turn-right {
                            animation: turnRight 1.5s ease-in-out infinite;
                          }
                          .animate-look-center {
                            animation: lookCenter 2s ease-in-out infinite;
                          }
                        `}</style>
                        <svg
                          viewBox="0 0 100 140"
                          className={`w-48 h-48 ${
                            currentPose === "left"
                              ? "animate-turn-left"
                              : currentPose === "right"
                                ? "animate-turn-right"
                                : "animate-look-center"
                          }`}
                          style={{
                            opacity: 0.5,
                            filter: "drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          <g style={{ transformOrigin: "center" }}>
                            {/* Hair */}
                            <ellipse cx="50" cy="35" rx="32" ry="28" fill="#3b82f6" opacity="0.9" />

                            {/* Head */}
                            <ellipse cx="50" cy="50" rx="30" ry="35" fill="#60a5fa" opacity="0.95" />

                            {/* Ears */}
                            <ellipse cx="20" cy="50" rx="6" ry="10" fill="#60a5fa" opacity="0.9" />
                            <ellipse cx="80" cy="50" rx="6" ry="10" fill="#60a5fa" opacity="0.9" />

                            {/* Eyes */}
                            <ellipse cx="40" cy="45" rx="4" ry="5" fill="#1e293b" />
                            <ellipse cx="60" cy="45" rx="4" ry="5" fill="#1e293b" />
                            <circle cx="41" cy="44" r="1.5" fill="white" />
                            <circle cx="61" cy="44" r="1.5" fill="white" />

                            {/* Eyebrows */}
                            <path
                              d="M 35 38 Q 40 36 45 38"
                              stroke="#1e293b"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 55 38 Q 60 36 65 38"
                              stroke="#1e293b"
                              strokeWidth="2"
                              fill="none"
                              strokeLinecap="round"
                            />

                            {/* Nose */}
                            <path
                              d="M 50 50 L 50 58 L 48 60 L 52 60"
                              stroke="#1e293b"
                              strokeWidth="1.5"
                              fill="none"
                              strokeLinecap="round"
                            />

                            {/* Mouth */}
                            <path
                              d="M 40 68 Q 50 72 60 68"
                              stroke="#1e293b"
                              strokeWidth="2.5"
                              fill="none"
                              strokeLinecap="round"
                            />

                            {/* Neck */}
                            <rect x="42" y="82" width="16" height="12" fill="#60a5fa" opacity="0.95" />

                            {/* Shoulders */}
                            <ellipse cx="50" cy="100" rx="35" ry="15" fill="#60a5fa" opacity="0.95" />

                            {/* Body */}
                            <rect x="25" y="95" width="50" height="30" rx="8" fill="#3b82f6" opacity="0.9" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  )}

                  {showCountdown && ["1", "2", "3"].includes(poseMessage) && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <style jsx>{`
                        @keyframes countdownPulse {
                          0% {
                            transform: scale(0.8);
                            opacity: 0;
                          }
                          50% {
                            transform: scale(1.1);
                            opacity: 1;
                          }
                          100% {
                            transform: scale(1);
                            opacity: 1;
                          }
                        }
                        .countdown-animate {
                          animation: countdownPulse 0.4s ease-out;
                        }
                      `}</style>
                      <div className="countdown-animate">
                        <p
                          className="text-white font-bold"
                          style={{
                            fontSize: "180px",
                            textShadow: "0 8px 16px rgba(0, 0, 0, 0.8), 0 0 40px rgba(255, 255, 255, 0.3)",
                            lineHeight: 1,
                          }}
                        >
                          {poseMessage}
                        </p>
                      </div>
                    </div>
                  )}

                  {!showCountdown && (
                    <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none">
                      <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-2xl">
                        <p className="text-white text-base font-medium">{poseMessage}</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-sm px-6 py-2 rounded-full">
                      <p className="text-white text-sm">
                        {completedPoses.has("center") ? "✓" : "○"} Center {completedPoses.has("left") ? "✓" : "○"} Left{" "}
                        {completedPoses.has("right") ? "✓" : "○"} Right
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        <div className="bg-secondary/50 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Remove glasses and hats
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Ensure good lighting
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Follow the head movement instructions
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          {!isCapturing && (
            <Button
              onClick={startCamera}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
              disabled={isLoading}
            >
              <Camera className="w-5 h-5 mr-2" />
              {isLoading ? "Starting..." : "Open Camera"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
