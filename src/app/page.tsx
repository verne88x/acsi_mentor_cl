import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getRoleBasedRedirect } from '@/lib/auth'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const redirectPath = getRoleBasedRedirect(user.role)
  redirect(redirectPath)
}
