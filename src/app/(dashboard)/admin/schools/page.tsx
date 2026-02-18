import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminSchoolsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'acsi_admin') redirect('/login')

  const supabase = await createClient()
  const { data: schools } = await supabase
    .from('schools')
    .select('*')
    .order('name')

  return (
    <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <div>
          <h1 style={{fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.5rem 0'}}>Schools</h1>
          <p style={{color: '#6b7280', margin: 0}}>Manage all schools</p>
        </div>
        <Link href="/admin/schools/new" style={{padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600}}>
          + Add School
        </Link>
      </div>

      <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#f9fafb'}}>
            <tr>
              <th style={{padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600}}>School Name</th>
              <th style={{padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600}}>Location</th>
              <th style={{padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600}}>Students</th>
              <th style={{padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools?.map((school: any) => (
              <tr key={school.id} style={{borderTop: '1px solid #f3f4f6'}}>
                <td style={{padding: '1rem 1.5rem', fontWeight: 500}}>{school.name}</td>
                <td style={{padding: '1rem 1.5rem', color: '#6b7280'}}>{school.town}, {school.county}</td>
                <td style={{padding: '1rem 1.5rem', color: '#6b7280'}}>{school.student_count || '—'}</td>
                <td style={{padding: '1rem 1.5rem'}}>
                  <Link href={`/schools/${school.id}`} style={{color: '#667eea', marginRight: '1rem'}}>View</Link>
                  <Link href={`/admin/schools/${school.id}/edit`} style={{color: '#667eea'}}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!schools || schools.length === 0) && (
          <div style={{padding: '3rem', textAlign: 'center', color: '#6b7280'}}>
            No schools yet. <Link href="/admin/schools/new" style={{color: '#667eea'}}>Add the first school!</Link>
          </div>
        )}
      </div>
    </div>
  )
}
