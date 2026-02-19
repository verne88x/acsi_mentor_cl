import { redirect } from 'next/navigation'
import { getCurrentUser, getUserSchools } from '@/lib/auth'
import Link from 'next/link'
import styles from './mentor.module.css'
import { detectRiskAlerts } from '@/lib/config/riskAlerts'
import RiskAlertsDashboard from '@/components/RiskAlertsDashboard'

export default async function MentorDashboard() {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'mentor' && user.role !== 'acsi_admin')) {
    redirect('/login')
  }

  const schools = await getUserSchools()
  const alerts = await detectRiskAlerts()

  return (
    <div className={styles.container}>
      
      {/* Risk Alerts Section */}
      {alerts.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🚨 Risk Alerts
            </h2>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Schools requiring attention
            </p>
          </div>
          <RiskAlertsDashboard alerts={alerts} />
        </div>
      )}

      <div className={styles.header}>
        <h1>My Schools</h1>
        <p>Schools you are mentoring</p>
      </div>

      {/* Quick Actions */}
      <div style={{ 
        marginBottom: '2rem', 
        display: 'flex', 
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <Link
          href="/consulting-requests"
          style={{
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}
        >
          View Consultation Requests
        </Link>
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
