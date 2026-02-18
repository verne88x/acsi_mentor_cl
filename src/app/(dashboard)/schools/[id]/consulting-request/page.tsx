import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ConsultingRequestForm from '@/components/ConsultingRequestForm'

export default async function ConsultingRequestPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Get school
  const { data: schoolData, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !schoolData) {
    redirect('/mentor')
  }

  const school = schoolData as any

  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ 
      maxWidth: '900px', 
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
            School Consulting Needs Assessment
          </h1>
          <p style={{ 
            color: '#6b7280',
            fontSize: '1rem'
          }}>
            {school.name}
          </p>
          <p style={{ 
            color: '#9ca3af',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}>
            Help us understand your school's needs so we can provide the best support.
          </p>
        </div>

        <ConsultingRequestForm school={school} userId={user.id} />
      </div>
    </div>
  )
}
