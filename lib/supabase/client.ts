import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wrotoqzgvykhxhmyzaox.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indyb3RvcXpndnlraHhobXl6YW94Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjYyNjgsImV4cCI6MjA3NTU0MjI2OH0.nvcs_4_d-aFWxtbx_9caDo76olPtqDi7TXyGaTWhULc"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
