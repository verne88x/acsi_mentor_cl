import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import styles from './school.module.css'

export default async function SchoolDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: schoolData, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !schoolData) {
    redirect('/mentor')
  }

  const school = schoolData as any

  // Get recent assessments
  const { data: assessments } = await supabase
    .from('assessments')
    .select('*, conducted_by:profiles(full_name, email)')
    .eq('school_id', params.id)
    .order('assessment_date', { ascending: false })
    .limit(5)

  return (
    <div className={styles.container}>
      <Link href="/mentor" className={styles.backButton}>
        ← Back to Schools
      </Link>

      <div className={styles.card}>
        <div className={styles.schoolHeader}>
          <div>
            <h1>{school.name}</h1>
            <p className={styles.location}>
              {school.town}, {school.county}
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {school.student_count && (
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Students</div>
              <div className={styles.statValue}>{school.student_count}</div>
            </div>
          )}
          {school.staff_count && (
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Staff</div>
              <div className={styles.statValue}>{school.staff_count}</div>
            </div>
          )}
          {school.head_teacher && (
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Head Teacher</div>
              <div className={styles.statValue}>{school.head_teacher}</div>
            </div>
          )}
        </div>

        <div className={styles.actionsGrid}>
          <Link
            href={`/schools/${params.id}/assessment`}
            className={styles.primaryButton}
          >
            <span>New Health Check Assessment</span>
            <span>→</span>
          </Link>

          <Link
            href={`/schools/${params.id}/growth`}
            className={styles.secondaryButton}
          >
            📈 Growth Over Time
          </Link>

          <Link
            href={`/schools/${params.id}/consulting-request`}
            className={styles.secondaryButton}
          >
            Consultation Form
          </Link>

          <Link
            href={`/schools/${params.id}/edit`}
            className={styles.secondaryButton}
          >
            Edit School Info
          </Link>

          <Link
            href={`/schools/${params.id}/assessments`}
            className={styles.secondaryButton}
          >
            View Past Assessments
          </Link>

          <Link
            href={`/schools/${params.id}/plans`}
            className={styles.secondaryButton}
          >
            Action Plans
          </Link>
        </div>

        {assessments && assessments.length > 0 && (
          <div className={styles.recentSection}>
            <h3>Recent Assessments</h3>
            <div className={styles.assessmentList}>
              {assessments.map((assessment: any) => (
                <div key={assessment.id} className={styles.assessmentItem}>
                  <div>
                    <div className={styles.assessmentDate}>
                      {new Date(assessment.assessment_date).toLocaleDateString()}
                    </div>
                    <div className={styles.assessmentMeta}>
                      by {assessment.conducted_by?.full_name || assessment.conducted_by?.email}
                    </div>
                  </div>
                  <div className={styles.assessmentScore}>
                    {assessment.overall_score ? (
                      <>
                        <span className={styles.scoreValue}>
                          {assessment.overall_score.toFixed(1)}
                        </span>
                        <span className={styles.scoreLabel}>/5.0</span>
                      </>
                    ) : (
                      <span className={styles.statusBadge}>
                        {assessment.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
