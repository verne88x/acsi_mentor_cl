import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'
import styles from './layout.module.css'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className={styles.layout}>
      <Navigation user={user} />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
