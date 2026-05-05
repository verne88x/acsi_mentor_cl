import sql from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SchoolEditForm from '@/components/SchoolEditForm'

export default async function EditSchoolPage({ params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  if (!rows[0]) redirect('/mentor')
  return (
    <div style={{maxWidth: '800px', margin: '0 auto', padding: '2rem'}}>
      <Link href={`/schools/${params.id}`} style={{color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block'}}>← Back to School</Link>
      <div style={{background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Edit School</h1>
        <SchoolEditForm school={rows[0]} />
      </div>
    </div>
  )
}
