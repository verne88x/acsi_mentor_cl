'use client'
import { Profile } from '@/types'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import styles from './Navigation.module.css'

interface NavigationProps { user: Profile }

export default function Navigation({ user }: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push('/login'); router.refresh()
  }

  const getNavItems = () => {
    switch (user.role) {
      case 'mentor': return [{ href: '/mentor', label: 'My Schools' }]
      case 'school_admin': return [{ href: '/school-admin', label: 'Dashboard' }]
      case 'acsi_admin': return [{ href: '/admin', label: 'Dashboard' }, { href: '/admin/schools', label: 'Schools' }, { href: '/admin/users', label: 'Users' }]
      default: return []
    }
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.navContent}>
        <div className={styles.brand}>
          <Link href={user.role === 'mentor' ? '/mentor' : user.role === 'school_admin' ? '/school-admin' : '/admin'}>ACSI School Mentor</Link>
        </div>
        <div className={styles.navItems}>
          {getNavItems().map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? styles.navItemActive : styles.navItem}>{item.label}</Link>
          ))}
        </div>
        <div className={styles.userSection}>
          <span className={styles.userName}>{user.full_name || user.email}</span>
          <button onClick={handleSignOut} className={styles.signOutButton}>Sign Out</button>
        </div>
      </div>
    </nav>
  )
}
