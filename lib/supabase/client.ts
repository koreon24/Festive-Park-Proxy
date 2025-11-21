import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jrcqedkdifxgsfvvbkgc.supabase.co"
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyY3FlZGtkaWZ4Z3NmdnZia2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwODQyODAsImV4cCI6MjA3NjY2MDI4MH0.2zZJzirNoh2MPIQuosZP6vYcxKn950iknZE9jkk4T1Q"

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
