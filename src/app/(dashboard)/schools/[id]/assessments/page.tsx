import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AssessmentListWithDelete from '@/components/AssessmentListWithDelete'
import AssessmentCompare from '@/components/AssessmentCompare'

export default async function AssessmentsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  const schoolRows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  if (!schoolRows[0]) redirect('/mentor')
  const school = schoolRows[0] as any
  const assessments = await sql`SELECT a.*, p.full_name, p.email FROM assessments a LEFT JOIN profiles p ON p.id = a.conducted_by WHERE a.school_id = ${params.id} ORDER BY a.assessment_date DESC`
  const isMentor = user && ['mentor', 'acsi_admin'].includes(user.role)
  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
      <Link href={`/schools/${params.id}`} style={{color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block'}}>← Back to School</Link>
      <div style={{background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Past Assessments</h1>
        <p style={{color: '#6b7280', margin: '0 0 2rem 0'}}>{school.name}</p>
        {assessments.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
            <p>No assessments yet.</p>
            <Link href={`/schools/${params.id}/assessment`} style={{display: 'inline-block', marginTop: '1.5rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none'}}>Start Assessment</Link>
          </div>
        ) : (
          <>
            {assessments.length >= 2 && <div style={{marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px'}}><h2 style={{color: '#1e40af', marginBottom: '1rem'}}>📊 Compare Assessments</h2><AssessmentCompare assessments={assessments} schoolId={params.id} /></div>}
            <AssessmentListWithDelete assessments={assessments} schoolId={params.id} isMentor={isMentor} />
          </>
        )}
      </div>
    </div>
  )
}
