"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Camera, ArrowLeft, Check, AlertCircle } from "lucide-react"
import Tesseract from "tesseract.js"

interface IdCaptureScreenProps {
  side: "front" | "back"
  onNext: (image: string) => void
  onBack: () => void
}

export default function IdCaptureScreen({ side, onNext, onBack }: IdCaptureScreenProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const detectionMessageRef = useRef<HTMLParagraphElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const isInitializingRef = useRef(false)
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isOcrRunningRef = useRef(false)
  const lastOcrResultRef = useRef<string>("")
  const [validationError, setValidationError] = useState<string | null>(null)

  const updateDetectionMessage = (message: string) => {
    if (detectionMessageRef.current) {
      detectionMessageRef.current.textContent = message
    }
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (isDetecting && videoRef.current) {
      let consecutiveTextDetections = 0
      const requiredDetections = 2

      updateDetectionMessage("Position your ID in the frame")

      detectionIntervalRef.current = setInterval(async () => {
        if (
          videoRef.current &&
          videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA &&
          !isOcrRunningRef.current
        ) {
          isOcrRunningRef.current = true

          try {
            const tempCanvas = document.createElement("canvas")
            tempCanvas.width = videoRef.current.videoWidth
            tempCanvas.height = videoRef.current.videoHeight
            const ctx = tempCanvas.getContext("2d", { willReadFrequently: false })

            if (ctx) {
              ctx.drawImage(videoRef.current, 0, 0)

              const result = await Tesseract.recognize(tempCanvas, "eng", {
                logger: () => {},
                tessedit_char_whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789- ",
                tessedit_pageseg_mode: Tesseract.PSM.AUTO,
              })

              const detectedText = result.data.text.trim()
              const confidence = result.data.confidence

              lastOcrResultRef.current = detectedText

              if (detectedText.length > 8 && confidence > 25) {
                consecutiveTextDetections++

                if (consecutiveTextDetections === 1) {
                  updateDetectionMessage("Hold steady")
                } else if (consecutiveTextDetections >= requiredDetections) {
                  updateDetectionMessage("Capturing...")
                  setIsDetecting(false)
                  if (detectionIntervalRef.current) {
                    clearInterval(detectionIntervalRef.current)
                  }
                  setTimeout(() => capturePhoto(), 500)
                }
              } else {
                if (consecutiveTextDetections > 0) {
                  consecutiveTextDetections = 0
                  updateDetectionMessage("Position your ID in the frame")
                }
              }
            }
          } catch (error) {
            consecutiveTextDetections = 0
          } finally {
            isOcrRunningRef.current = false
          }
        }
      }, 1500)
    }

    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current)
      }
    }
  }, [isDetecting])

  const initializeCamera = async () => {
    if (isInitializingRef.current) {
      return
    }

    if (!window.isSecureContext) {
      setError(
        "Camera requires HTTPS or localhost. Your app is running on an insecure connection. Please access via HTTPS/localhost.",
      )
      setIsCapturing(false)
      return
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Camera API not available in this browser.")
      setIsCapturing(false)
      return
    }

    if (!videoRef.current) {
      setError("Video element not ready. Please try again.")
      setIsCapturing(false)
      return
    }

    isInitializingRef.current = true
    setIsLoading(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 3840, min: 1920 },
          height: { ideal: 2160, min: 1080 },
          frameRate: { ideal: 30, max: 30 },
          aspectRatio: { ideal: 16 / 9 },
        },
      })

      if (!videoRef.current) {
        throw new Error("Video element not available")
      }

      if (stream) {
        streamRef.current = stream
        videoRef.current.srcObject = stream

        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error("Video ref lost"))
            return
          }

          const timeoutId = setTimeout(() => {
            reject(new Error("Video metadata load timeout"))
          }, 10000)

          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeoutId)

            videoRef.current
              ?.play()
              .then(() => {
                setIsDetecting(true)
                updateDetectionMessage("Position your ID in the frame")
                resolve()
              })
              .catch((err) => {
                reject(err)
              })
          }

          videoRef.current.onerror = (err) => {
            clearTimeout(timeoutId)
            reject(err)
          }
        })
      } else {
        throw new Error("No stream obtained")
      }
    } catch (error: any) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setError("Camera permission denied. Please allow camera access in your browser settings and refresh the page.")
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setError("No camera found on this device.")
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setError("Camera is in use by another app. Please close other apps using the camera and try again.")
      } else if (error.name === "OverconstrainedError" || error.name === "ConstraintNotSatisfiedError") {
        setError("Camera does not meet requirements. Please try a different device.")
      } else if (error.message?.includes("timeout")) {
        setError("Camera initialization timed out. Please try again.")
      } else {
        setError(`Unable to access camera. ${error.message || "Please check your camera permissions and try again."}`)
      }

      setIsCapturing(false)
    } finally {
      setIsLoading(false)
      isInitializingRef.current = false
    }
  }

  const startCamera = () => {
    setIsDetecting(false)
    setValidationError(null)
    setIsCapturing(true)
    setTimeout(() => {
      initializeCamera()
    }, 100)
  }

  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)

        const imageDataUrl = canvas.toDataURL("image/jpeg", 0.98)

        setCapturedImage(imageDataUrl)
        stopCamera()

        await validateCapturedImage(imageDataUrl)
      }
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current)
    }
    setIsDetecting(false)
    setIsCapturing(false)
    isInitializingRef.current = false
  }

  const retake = () => {
    setCapturedImage(null)
    setError(null)
    startCamera()
  }

  const validateCapturedImage = async (imageData: string) => {
    setIsLoading(true)
    setValidationError(null)

    await new Promise((resolve) => setTimeout(resolve, 800))

    try {
      const detectedText = lastOcrResultRef.current.toLowerCase().replace(/\s+/g, " ").trim()

      if (detectedText.length < 8) {
        setValidationError("Could not read ID. Please try again with better lighting.")
        setCapturedImage(null)
        setIsLoading(false)
        return
      }

      const idKeywords = [
        "school",
        "student",
        "id",
        "university",
        "college",
        "name",
        "date",
        "birth",
        "issued",
        "expires",
        "valid",
        "card",
        "identification",
        "academy",
        "institute",
        "campus",
        "dept",
        "department",
      ]
      const keywordMatches = idKeywords.filter((keyword) => detectedText.includes(keyword)).length

      if (keywordMatches < 1) {
        setValidationError("This doesn't appear to be a school ID. Please scan your ID card.")
        setCapturedImage(null)
        setIsLoading(false)
        return
      }

      setIsLoading(false)
    } catch (error) {
      setValidationError("Could not validate ID. Please try again.")
      setCapturedImage(null)
      setIsLoading(false)
    }
  }

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
                <span className="text-xs font-bold text-primary-foreground">{side === "front" ? "1" : "2"}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground">
                Scan School ID - {side === "front" ? "Front" : "Back"}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {side === "front" ? "Show the front of your ID card" : "Show the back of your ID card"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {validationError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive">{validationError}</p>
          </div>
        )}

        <div className="relative aspect-[3/2] bg-secondary rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              opacity: isCapturing && !capturedImage ? 1 : 0,
              pointerEvents: isCapturing && !capturedImage ? "auto" : "none",
              transition: "none",
            }}
          />

          {!capturedImage && !isCapturing && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Camera className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">No image captured yet</p>
              </div>
            </div>
          )}

          {isLoading && !isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">Validating ID...</p>
                  <p className="text-sm text-muted-foreground">Please wait</p>
                </div>
              </div>
            </div>
          )}

          {isLoading && isCapturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-secondary/90">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Starting camera...</p>
              </div>
            </div>
          )}

          {isCapturing && !isLoading && isDetecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
              <div className="bg-black/70 px-6 py-3 rounded-full">
                <p ref={detectionMessageRef} className="text-white text-sm font-medium">
                  Position your ID in the frame
                </p>
              </div>
            </div>
          )}

          {capturedImage && !isLoading && (
            <div className="absolute inset-0 w-full h-full">
              <img src={capturedImage || "/placeholder.svg"} alt="Captured ID" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {!capturedImage && !isCapturing && (
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

          {capturedImage && !isLoading && (
            <>
              <Button
                onClick={() => onNext(capturedImage)}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                Continue
              </Button>
              <Button onClick={retake} variant="outline" className="w-full bg-transparent" size="lg">
                Retake Photo
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
