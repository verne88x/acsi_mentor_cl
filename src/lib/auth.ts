import { auth } from '@/auth'
import sql from '@/lib/db'
import { Profile, Role } from '@/types'

export async function getSession() { return await auth() }

export async function getCurrentUser(): Promise<Profile | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  const rows = await sql`SELECT * FROM profiles WHERE id = ${session.user.id}`
  if (!rows[0]) return null
  return rows[0] as Profile
}

export async function hasRole(role: Role): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

export async function isAdmin() { return hasRole('acsi_admin') }

export async function isMentor(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'mentor' || user?.role === 'acsi_admin'
}

export async function getUserSchools() {
  const session = await auth()
  if (!session?.user?.id) return []
  return await sql`
    SELECT s.id, s.name, s.county, s.town
    FROM school_members sm JOIN schools s ON s.id = sm.school_id
    WHERE sm.user_id = ${session.user.id}
  `
}

export function getRoleBasedRedirect(role: Role): string {
  switch (role) {
    case 'mentor': return '/mentor'
    case 'school_admin': return '/school-admin'
    case 'acsi_admin': return '/admin'
    default: return '/login'
  }
}
