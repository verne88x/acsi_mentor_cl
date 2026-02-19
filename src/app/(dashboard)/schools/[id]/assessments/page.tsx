import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AssessmentListWithDelete from '@/components/AssessmentListWithDelete'
import AssessmentCompare from '@/components/AssessmentCompare'

export default async function AssessmentsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  const { data: schoolData, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('id', params.id)
    .single()

  if (schoolError || !schoolData) {
    redirect('/mentor')
  }

  const school = schoolData as any

  const { data: assessmentsData } = await supabase
    .from('assessments')
    .select(`
      *,
      conductor:profiles!conducted_by(full_name, email),
      action_plans(id, title, status)
    `)
    .eq('school_id', params.id)
    .order('assessment_date', { ascending: false })

  const assessments = (assessmentsData as any) || []
  const isMentor = user && ['mentor', 'acsi_admin'].includes(user.role)
  const hasMultiple = assessments.length >= 2

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <Link
        href={`/schools/${params.id}`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          color: '#3b82f6', textDecoration: 'none',
          marginBottom: '2rem', fontSize: '0.875rem'
        }}
      >
        ← Back to School
      </Link>

      <div style={{
        background: 'white', borderRadius: '8px', padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
              Past Assessments
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>{school.name}</p>
          </div>
          {hasMultiple && (
            <div style={{
              padding: '0.5rem 1rem', background: '#eff6ff',
              border: '1px solid #bfdbfe', borderRadius: '8px',
              fontSize: '0.875rem', color: '#3b82f6', fontWeight: '500'
            }}>
              {assessments.length} assessments available
            </div>
          )}
        </div>

        {assessments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <p style={{ marginBottom: '1rem' }}>No assessments yet.</p>
            <Link
              href={`/schools/${params.id}/assessment`}
              style={{
                display: 'inline-block', marginTop: '1.5rem',
                padding: '0.75rem 1.5rem', background: '#3b82f6',
                color: 'white', borderRadius: '6px',
                textDecoration: 'none', fontWeight: '500'
              }}
            >
              Start Assessment
            </Link>
          </div>
        ) : (
          <>
            {/* Compare Section - shown when 2+ assessments */}
            {hasMultiple && (
              <div style={{
                marginBottom: '2rem', padding: '1.5rem',
                background: '#f8fafc', borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem', color: '#1e40af' }}>
                  📊 Compare Assessments
                </h2>
                <AssessmentCompare assessments={assessments} schoolId={params.id} />
              </div>
            )}

            {/* Assessment List */}
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1rem' }}>
              All Assessments
            </h2>
            <AssessmentListWithDelete
              assessments={assessments}
              schoolId={params.id}
              isMentor={isMentor}
            />
          </>
        )}
      </div>
    </div>
  )
}
