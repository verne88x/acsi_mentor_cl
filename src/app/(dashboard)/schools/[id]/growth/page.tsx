import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GrowthDashboard from '@/components/GrowthDashboard'

export default async function GrowthPage({
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

  // Get all completed assessments for this school, ordered by date
  const { data: assessmentsData, error: assessmentsError } = await supabase
    .from('assessments')
    .select('*')
    .eq('school_id', params.id)
    .eq('status', 'completed')
    .order('assessment_date', { ascending: true })

  const assessments = (assessmentsData as any) || []

  return (
    <div style={{ 
      maxWidth: '1400px', 
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
        padding: '2.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold',
            marginBottom: '0.5rem',
            color: '#111827'
          }}>
            Growth Over Time
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '1rem',
            margin: 0
          }}>
            {school.name}
          </p>
        </div>

        {assessments.length < 2 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: '#6b7280'
          }}>
            <p style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              Not enough data yet
            </p>
            <p style={{ fontSize: '0.875rem' }}>
              At least 2 completed assessments are needed to show growth trends.
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '1rem' }}>
              Current assessments: {assessments.length}
            </p>
          </div>
        ) : (
          <GrowthDashboard school={school} assessments={assessments} />
        )}
      </div>
    </div>
  )
}
