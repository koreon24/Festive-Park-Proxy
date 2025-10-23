export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
      return new Response("URL parameter is required", { status: 400 })
    }

    // Fetch the target URL
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    const html = await response.text()

    // Inject base tag to handle relative URLs
    const baseUrl = new URL(targetUrl).origin
    const modifiedHtml = html.replace("<head>", `<head><base href="${baseUrl}/">`)

    return new Response(modifiedHtml, {
      headers: {
        "Content-Type": "text/html",
        "X-Frame-Options": "SAMEORIGIN",
      },
    })
  } catch (error) {
    console.error("[v0] Proxy error:", error)
    return new Response("Failed to fetch URL", { status: 500 })
  }
}
