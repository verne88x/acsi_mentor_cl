import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ConsultingRequestDetail from '@/components/ConsultingRequestDetail'

export default async function ConsultingRequestDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || !['mentor', 'acsi_admin'].includes(user.role)) redirect('/login')
  const rows = await sql`
    SELECT cr.*, s.id as school_id, s.name as school_name, s.town, s.county, s.address, s.phone, s.head_teacher, s.student_count, s.staff_count,
           p.full_name as creator_name, p.email as creator_email
    FROM consulting_requests cr JOIN schools s ON s.id = cr.school_id JOIN profiles p ON p.id = cr.created_by
    WHERE cr.id = ${params.id}
  `
  if (!rows[0]) redirect('/consulting-requests')
  const r = rows[0] as any
  const request = { ...r, school: { id: r.school_id, name: r.school_name, town: r.town, county: r.county, address: r.address, phone: r.phone, head_teacher: r.head_teacher, student_count: r.student_count, staff_count: r.staff_count }, creator: { full_name: r.creator_name, email: r.creator_email } }
  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
      <Link href="/consulting-requests" style={{color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block'}}>← Back to All Requests</Link>
      <ConsultingRequestDetail request={request} />
    </div>
  )
}
