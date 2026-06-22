import sql from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ShareAssessmentButton from '@/components/ShareAssessmentButton'
import styles from './school.module.css'

export default async function SchoolDetailPage({ params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  if (!rows[0]) redirect('/mentor')
  const school = rows[0] as any
  const assessments = await sql`SELECT a.*, p.full_name, p.email FROM assessments a LEFT JOIN profiles p ON p.id = a.conducted_by WHERE a.school_id = ${params.id} ORDER BY a.assessment_date DESC LIMIT 5`
  return (
    <div className={styles.container}>
      <Link href="/mentor" className={styles.backButton}>← Back to Schools</Link>
      <div className={styles.card}>
        <div className={styles.schoolHeader}>
          <div><h1>{school.name}</h1><p className={styles.location}>{school.town}, {school.county}</p></div>
        </div>
        <div className={styles.actionsGrid}>
          <Link href={`/schools/${params.id}/assessment`} className={styles.primaryButton}><span>New Health Check Assessment</span><span>→</span></Link>
          <ShareAssessmentButton schoolId={params.id} />
          <Link href={`/schools/${params.id}/growth`} className={styles.secondaryButton}>📈 Growth Over Time</Link>
          <Link href={`/schools/${params.id}/consulting-request`} className={styles.secondaryButton}>Consultation Form</Link>
          <Link href={`/schools/${params.id}/edit`} className={styles.secondaryButton}>Edit School Info</Link>
          <Link href={`/schools/${params.id}/assessments`} className={styles.secondaryButton}>View Past Assessments</Link>
          <Link href={`/schools/${params.id}/plans`} className={styles.secondaryButton}>Action Plans</Link>
          <Link href={`/schools/${params.id}/visits`} className={styles.secondaryButton}>📋 Visit Log</Link>
        </div>
      </div>
    </div>
  )
}
