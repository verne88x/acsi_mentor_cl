import sql from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import GrowthDashboard from '@/components/GrowthDashboard'

export default async function GrowthPage({ params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  if (!rows[0]) redirect('/mentor')
  const school = rows[0] as any
  const assessments = await sql`SELECT * FROM assessments WHERE school_id = ${params.id} AND status = 'completed' AND conducted_by IS NOT NULL ORDER BY assessment_date ASC`
  const selfAssessments = await sql`SELECT * FROM assessments WHERE school_id = ${params.id} AND status = 'completed' AND respondent_name IS NOT NULL ORDER BY assessment_date DESC LIMIT 10`
  return (
    <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
      <Link href={`/schools/${params.id}`} style={{color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block'}}>← Back to School</Link>
      <div style={{background: 'white', borderRadius: '8px', padding: '2.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem'}}>Growth Over Time</h1>
        <p style={{color: '#6b7280', margin: '0 0 2rem 0'}}>{school.name}</p>
        {assessments.length < 2 ? <p style={{textAlign: 'center', color: '#6b7280', padding: '3rem'}}>At least 2 assessments needed.</p> : <GrowthDashboard school={school} assessments={assessments} selfAssessments={selfAssessments} />}
      </div>
    </div>
  )
}
