import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getScoreLabel, getScoreColor } from '@/lib/config/healthCheckConfig'

export default async function AssessmentsPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get school
  const { data: schoolData, error: schoolError } = await supabase
    .from('schools')
    .select('*')
    .eq('id', params.id)
    .single()

  if (schoolError || !schoolData) {
    redirect('/mentor')
  }

  const school = schoolData as any

  // Get all assessments for this school
  const { data: assessments } = await supabase
    .from('assessments')
    .select(`
      *,
      conductor:profiles!conducted_by(full_name, email),
      action_plans(id, title, status)
    `)
    .eq('school_id', params.id)
    .order('assessment_date', { ascending: false })

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      <Link 
        href={`/schools/${params.id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#3b82f6',
          textDecoration: 'none',
          marginBottom: '2rem',
          fontSize: '0.875rem'
        }}
      >
        ← Back to School
      </Link>

      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            margin: '0 0 0.5rem 0'
          }}>
            Past Assessments
          </h1>
          <p style={{ 
            color: '#6b7280',
            margin: 0
          }}>
            {school.name}
          </p>
        </div>

        {!assessments || assessments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <p style={{ marginBottom: '1rem' }}>No assessments yet.</p>
            <p style={{ fontSize: '0.875rem' }}>
              Create your first health check assessment to track school progress.
            </p>
            <Link
              href={`/schools/${params.id}/assessment`}
              style={{
                display: 'inline-block',
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              New Health Check Assessment
            </Link>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem' 
          }}>
            {assessments.map((assessment: any) => {
              const scoreColor = assessment.overall_score 
                ? getScoreColor(Math.round(assessment.overall_score))
                : '#6b7280'
              const scoreLabel = assessment.overall_score
                ? getScoreLabel(Math.round(assessment.overall_score))
                : 'Draft'

              return (
                <div
                  key={assessment.id}
                  style={{
                    padding: '1.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '0.5rem',
                        color: '#111827'
                      }}>
                        Assessment - {new Date(assessment.assessment_date).toLocaleDateString()}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#6b7280'
                      }}>
                        Conducted by: {assessment.conductor?.full_name || assessment.conductor?.email}
                      </div>
                      {assessment.notes && (
                        <div style={{
                          marginTop: '0.5rem',
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          {assessment.notes}
                        </div>
                      )}
                    </div>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.5rem'
                    }}>
                      {assessment.overall_score ? (
                        <>
                          <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: scoreColor
                          }}>
                            {assessment.overall_score.toFixed(1)}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '9999px',
                            background: `${scoreColor}20`,
                            color: scoreColor
                          }}>
                            {scoreLabel}
                          </div>
                        </>
                      ) : (
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '9999px',
                          background: '#f3f4f6',
                          color: '#6b7280'
                        }}>
                          Draft
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '1rem'
                  }}>
                    <Link
                      href={`/schools/${params.id}/assessment/${assessment.id}/plan`}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      View Details
                    </Link>

                    {assessment.action_plans && assessment.action_plans.length > 0 && (
                      <Link
                        href={`/schools/${params.id}/plans/${assessment.action_plans[0].id}`}
                        style={{
                          padding: '0.5rem 1rem',
                          background: 'white',
                          color: '#3b82f6',
                          border: '1px solid #3b82f6',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                      >
                        View Action Plan
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
