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
  return await sql`
    SELECT s.id, s.name, s.county, s.town
    FROM school_members sm JOIN schools s ON s.id = sm.school_id
    WHERE sm.user_id = ${(session.user as any).id}
  `
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
