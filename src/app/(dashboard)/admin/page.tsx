import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import styles from './admin.module.css'

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'acsi_admin') {
    redirect('/login')
  }

  const supabase = await createClient()

  // Get statistics
  const [
    { count: schoolsCount },
    { count: usersCount },
    { count: assessmentsCount },
  ] = await Promise.all([
    supabase.from('schools').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('assessments').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Manage schools, users, and platform settings</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Schools</div>
          <div className={styles.statValue}>{schoolsCount || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Users</div>
          <div className={styles.statValue}>{usersCount || 0}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Assessments Completed</div>
          <div className={styles.statValue}>{assessmentsCount || 0}</div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionsGrid}>
          <Link href="/admin/schools/new" className={styles.actionCard}>
            <div className={styles.actionIcon}>🏫</div>
            <div className={styles.actionTitle}>Add New School</div>
            <div className={styles.actionDescription}>
              Register a new school in the platform
            </div>
          </Link>

          <Link href="/admin/users/invite" className={styles.actionCard}>
            <div className={styles.actionIcon}>👤</div>
            <div className={styles.actionTitle}>Invite User</div>
            <div className={styles.actionDescription}>
              Send invitation to mentor or school admin
            </div>
          </Link>

          <Link href="/admin/schools" className={styles.actionCard}>
            <div className={styles.actionIcon}>📋</div>
            <div className={styles.actionTitle}>Manage Schools</div>
            <div className={styles.actionDescription}>
              View and edit school information
            </div>
          </Link>

          <Link href="/admin/users" className={styles.actionCard}>
            <div className={styles.actionIcon}>👥</div>
            <div className={styles.actionTitle}>Manage Users</div>
            <div className={styles.actionDescription}>
              View users and assign roles
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
