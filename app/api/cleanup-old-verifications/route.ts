import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { del } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    // Verify the request is from Vercel Cron or has the correct secret
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Calculate the date 30 days ago
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Query verifications older than 30 days
    const { data: oldVerifications, error: queryError } = await supabase
      .from("verifications")
      .select("*")
      .lt("created_at", thirtyDaysAgo.toISOString())

    if (queryError) {
      console.error("[v0] Error querying old verifications:", queryError)
      return NextResponse.json({ error: "Failed to query verifications" }, { status: 500 })
    }

    if (!oldVerifications || oldVerifications.length === 0) {
      return NextResponse.json({
        message: "No old verifications to clean up",
        deleted: 0,
      })
    }

    let deletedCount = 0
    let errorCount = 0

    // Delete images from Blob storage and remove verification records
    for (const verification of oldVerifications) {
      try {
        // Delete images from Blob storage
        const imagesToDelete = [verification.id_front_url, verification.id_back_url, verification.face_url].filter(
          Boolean,
        ) // Remove null/undefined values

        for (const imageUrl of imagesToDelete) {
          try {
            await del(imageUrl)
            console.log("[v0] Deleted image:", imageUrl)
          } catch (deleteError) {
            console.error("[v0] Error deleting image:", imageUrl, deleteError)
            errorCount++
          }
        }

        // Delete the verification record from database
        const { error: deleteError } = await supabase.from("verifications").delete().eq("id", verification.id)

        if (deleteError) {
          console.error("[v0] Error deleting verification record:", deleteError)
          errorCount++
        } else {
          deletedCount++
        }
      } catch (error) {
        console.error("[v0] Error processing verification:", error)
        errorCount++
      }
    }

    return NextResponse.json({
      message: "Cleanup completed",
      deleted: deletedCount,
      errors: errorCount,
      total: oldVerifications.length,
    })
  } catch (error) {
    console.error("[v0] Cleanup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
