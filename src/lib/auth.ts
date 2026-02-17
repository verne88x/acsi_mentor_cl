import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { Profile, Role } from '@/types'

/**
 * Get current user session (server-side)
 */
export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Get current user profile (server-side)
 */
export async function getCurrentUser(): Promise<Profile | null> {
  const session = await getSession()
  if (!session) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (error || !data) return null
  return data as Profile
}

/**
 * Check if user has a specific role
 */
export async function hasRole(role: Role): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === role
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('acsi_admin')
}

/**
 * Check if user is mentor
 */
export async function isMentor(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'mentor' || user?.role === 'acsi_admin'
}

/**
 * Get user's accessible schools
 */
export async function getUserSchools() {
  const session = await getSession()
  if (!session) return []

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('school_members')
    .select(`
      school_id,
      schools (
        id,
        name,
        county,
        town
      )
    `)
    .eq('user_id', session.user.id)

  if (error || !data) return []
  
  return data.map((item: any) => item.schools).filter(Boolean)
}

/**
 * Sign out user (client-side)
 */
export async function signOut() {
  const supabase = createBrowserClient()
  await supabase.auth.signOut()
  window.location.href = '/login'
}

/**
 * Redirect based on user role
 */
export function getRoleBasedRedirect(role: Role): string {
  switch (role) {
    case 'mentor':
      return '/mentor'
    case 'school_admin':
      return '/school-admin'
    case 'acsi_admin':
      return '/admin'
    default:
      return '/login'
  }
}
