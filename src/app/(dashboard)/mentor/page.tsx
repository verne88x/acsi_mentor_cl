import { redirect } from 'next/navigation'
import { getCurrentUser, getUserSchools } from '@/lib/auth'
import Link from 'next/link'
import styles from './mentor.module.css'

export default async function MentorDashboard() {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'mentor' && user.role !== 'acsi_admin')) {
    redirect('/login')
  }

  const schools = await getUserSchools()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Schools</h1>
        <p>Schools you are mentoring</p>
      </div>

      {schools.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No schools assigned yet.</p>
          <p>Contact your administrator to get assigned to schools.</p>
        </div>
      ) : (
        <div className={styles.schoolGrid}>
          {schools.map((school: any) => (
            <Link
              key={school.id}
              href={`/schools/${school.id}`}
              className={styles.schoolCard}
            >
              <h3>{school.name}</h3>
              <div className={styles.schoolInfo}>
                <span>{school.town}, {school.county}</span>
              </div>
              <div className={styles.cardFooter}>
                <span>View Details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
