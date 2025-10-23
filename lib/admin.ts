// Shared admin configuration
export const ADMIN_EMAILS = ["carsonzhorse@gmail.com", "ChenEmperor1020@gmail.com"]

export const ADMIN_NAMES: Record<string, string> = {
  "carsonzhorse@gmail.com": "Carson",
  "chenemperor1020@gmail.com": "Aiden",
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

export function getAdminName(email: string | null | undefined): string {
  if (!email) return "Admin"
  return ADMIN_NAMES[email.toLowerCase()] || "Admin"
}
