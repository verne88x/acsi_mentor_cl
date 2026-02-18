import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ActionPlansPage({
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

  // Get all action plans for this school
  const { data: actionPlans } = await supabase
    .from('action_plans')
    .select(`
      *,
      action_items(count),
      creator:profiles!created_by(full_name, email)
    `)
    .eq('school_id', params.id)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e'
      case 'completed': return '#3b82f6'
      case 'archived': return '#6b7280'
      default: return '#eab308'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

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
            Action Plans
          </h1>
          <p style={{ 
            color: '#6b7280',
            margin: 0
          }}>
            {school.name}
          </p>
        </div>

        {!actionPlans || actionPlans.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: '#6b7280'
          }}>
            <p style={{ marginBottom: '1rem' }}>No action plans yet.</p>
            <p style={{ fontSize: '0.875rem' }}>
              Complete a health check assessment to generate an action plan.
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
            {actionPlans.map((plan: any) => (
              <Link
                key={plan.id}
                href={`/schools/${params.id}/plans/${plan.id}`}
                style={{
                  display: 'block',
                  padding: '1.5rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#3b82f6'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      margin: '0 0 0.5rem 0'
                    }}>
                      {plan.title}
                    </h3>
                    {plan.description && (
                      <p style={{
                        color: '#6b7280',
                        fontSize: '0.875rem',
                        margin: '0 0 0.75rem 0'
                      }}>
                        {plan.description}
                      </p>
                    )}
                    <div style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      <span>
                        Created: {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                      {plan.start_date && (
                        <span>
                          Start: {new Date(plan.start_date).toLocaleDateString()}
                        </span>
                      )}
                      {plan.end_date && (
                        <span>
                          End: {new Date(plan.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.5rem'
                  }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: `${getStatusColor(plan.status)}20`,
                      color: getStatusColor(plan.status)
                    }}>
                      {getStatusLabel(plan.status)}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: '#6b7280'
                    }}>
                      {plan.action_items?.[0]?.count || 0} action items
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
