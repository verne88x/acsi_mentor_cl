import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SchoolEditForm from '@/components/SchoolEditForm'

export default async function EditSchoolPage({
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

  return (
    <div style={{ 
      maxWidth: '800px', 
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
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          Edit School
        </h1>
        <p style={{ 
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Update school information
        </p>

        <SchoolEditForm school={school} />
      </div>
    </div>
  )
}
