import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { createClient } from "@/lib/supabase/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, dateOfBirth, idFrontUrl, idBackUrl, faceCenterUrl, faceLeftUrl, faceRightUrl } =
      await request.json()

    if (
      !email ||
      !fullName ||
      !dateOfBirth ||
      !idFrontUrl ||
      !idBackUrl ||
      !faceCenterUrl ||
      !faceLeftUrl ||
      !faceRightUrl
    ) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: verification, error: dbError } = await supabase
      .from("verifications")
      .insert({
        email,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        face_images_urls: {
          center: faceCenterUrl,
          left: faceLeftUrl,
          right: faceRightUrl,
        },
        status: "pending",
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    await resend.emails.send({
      from: "School Verification <onboarding@resend.dev>",
      to: "carsonzhorse@gmail.com",
      subject: "New School ID Verification Submission",
      html: `
        <h2>New School ID Verification Submission</h2>
        
        <h3>User Information:</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Date of Birth:</strong> ${dateOfBirth}</p>
        
        <h3>ID Photos:</h3>
        <p><strong>Front:</strong> <a href="${idFrontUrl}">View ID Front</a></p>
        <p><strong>Back:</strong> <a href="${idBackUrl}">View ID Back</a></p>
        
        <h3>Face Verification Photos:</h3>
        <p><strong>Center:</strong> <a href="${faceCenterUrl}">View Face Center</a></p>
        <p><strong>Left:</strong> <a href="${faceLeftUrl}">View Face Left</a></p>
        <p><strong>Right:</strong> <a href="${faceRightUrl}">View Face Right</a></p>
        
        <p>Submitted at: ${new Date().toLocaleString()}</p>
        
        <p><a href="${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://festiveparkwithlucen.vercel.app"}/admin">View in Admin Dashboard</a></p>
      `,
    })

    return NextResponse.json(
      {
        success: true,
        message: "Verification submitted successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
