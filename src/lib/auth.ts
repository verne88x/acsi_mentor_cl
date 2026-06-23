import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"

export async function getSession() {
  return await getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const rows = await sql`SELECT * FROM profiles WHERE id = ${(session.user as any).id}`
  return rows[0] || null
}

export async function getUserSchools() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return []
  // All users see all schools - filter by region in UI
  return await sql`SELECT * FROM schools ORDER BY region NULLS LAST, name`
}

export function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case "mentor": return "/mentor"
    case "regional_manager": return "/mentor"
    case "school_admin": return "/school-admin"
    case "acsi_admin": return "/admin"
    default: return "/login"
  }
}
