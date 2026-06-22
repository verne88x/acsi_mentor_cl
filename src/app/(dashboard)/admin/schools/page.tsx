import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import sql from '@/lib/db'
import Link from 'next/link'

export default async function AdminSchoolsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'acsi_admin') redirect('/login')
  const schools = await sql`SELECT * FROM schools ORDER BY region NULLS LAST, name`
  return (
    <div style={{padding: '2rem', maxWidth: '1400px', margin: '0 auto'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
        <h1 style={{fontSize: '1.875rem', fontWeight: 700}}>Schools</h1>
        <Link href="/admin/schools/new" style={{padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 600}}>+ Add School</Link>
      </div>
      <div style={{background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead style={{background: '#f9fafb'}}><tr>
            <th style={{padding: '1rem 1.5rem', textAlign: 'left'}}>School Name</th>
            <th style={{padding: '1rem 1.5rem', textAlign: 'left'}}>Region</th>
              <th style={{padding: '1rem 1.5rem', textAlign: 'left'}}>Location</th>
            <th style={{padding: '1rem 1.5rem', textAlign: 'left'}}>Actions</th>
          </tr></thead>
          <tbody>
            {schools.map((school: any) => (
              <tr key={school.id} style={{borderTop: '1px solid #f3f4f6'}}>
                <td style={{padding: '1rem 1.5rem', fontWeight: 500}}>{school.name}</td>
                <td style={{padding: '1rem 1.5rem', color: '#6b7280'}}>{school.region || '—'}</td>
                <td style={{padding: '1rem 1.5rem', color: '#6b7280'}}>{school.town}, {school.county}</td>
                <td style={{padding: '1rem 1.5rem'}}>
                  <Link href={`/schools/${school.id}`} style={{color: '#667eea', marginRight: '1rem'}}>View</Link>
                  <Link href={`/admin/schools/${school.id}/edit`} style={{color: '#667eea', marginRight: '1rem'}}>Edit</Link>
                  <Link href={`/admin/schools/${school.id}/mentors`} style={{color: '#667eea'}}>Mentors</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
