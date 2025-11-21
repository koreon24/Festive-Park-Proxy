"use client"

import type React from "react"
import { getAdminName } from "@/lib/admin"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Send, Sparkles, BookOpen, X } from "lucide-react"
import { put } from "@vercel/blob"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
  imageUrl?: string
}

export default function HomeworkHelper({ user }: { user: any }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const blob = await put(file.name, file, {
        access: "public",
      })
      setUploadedImage(blob.url)
    } catch (error) {
      console.error("[v0] Image upload error:", error)
      alert("Failed to upload image. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && !uploadedImage) return

    const userMessage: Message = {
      role: "user",
      content: input,
      imageUrl: uploadedImage || undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      console.log("[v0] Sending homework help request")
      const response = await fetch("/api/homework-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          imageUrl: uploadedImage,
        }),
      })

      console.log("[v0] Response status:", response.status)
      const data = await response.json()
      console.log("[v0] Response data:", data)

      if (data.error) {
        console.error("[v0] API returned error:", data.error, data.details, data.type)
        throw new Error(data.error)
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
        },
      ])
      setUploadedImage(null)
    } catch (error) {
      console.error("[v0] Homework help error:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const firstName = user?.email
    ? getAdminName(user.email) !== "Admin"
      ? getAdminName(user.email)
      : user.email.split("@")[0].charAt(0).toUpperCase() + user.email.split("@")[0].slice(1)
    : "Student"

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 animate-gradient" />

      <div className="relative z-10 min-h-screen p-4">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Homework Helper</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hey {firstName}!</span>
                  <span className="px-2 py-0.5 text-xs font-semibold bg-primary/20 text-primary rounded-full">
                    BETA
                  </span>
                </div>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="glass-strong p-6 min-h-[600px] flex flex-col">
            {/* Messages */}
            <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[500px]">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">How can I help you learn today?</h2>
                    <p className="text-muted-foreground max-w-md">
                      Upload a homework problem or describe what you're working on. I'll explain similar concepts to
                      help you understand, but I won't give you the direct answer!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        message.role === "user" ? "bg-primary text-primary-foreground" : "glass border border-border"
                      }`}
                    >
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl || "/placeholder.svg"}
                          alt="Uploaded homework"
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="glass border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {uploadedImage && (
                <div className="relative inline-block">
                  <img src={uploadedImage || "/placeholder.svg"} alt="Preview" className="h-20 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setUploadedImage(null)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="w-4 h-4" />
                </Button>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe your homework problem..."
                  className="flex-1 min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <Button type="submit" size="icon" disabled={loading || (!input.trim() && !uploadedImage)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
