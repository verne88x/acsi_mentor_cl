import sql from '@/lib/db'
import { redirect } from 'next/navigation'
import ActionPlanGenerator from '@/components/ActionPlanGenerator'

export default async function ActionPlanPage({ params }: { params: { id: string; assessmentId: string } }) {
  const rows = await sql`
    SELECT a.*, s.id as school_id, s.name as school_name, s.county, s.town, s.address, s.phone, s.email as school_email, s.head_teacher, s.student_count, s.staff_count
    FROM assessments a JOIN schools s ON s.id = a.school_id
    WHERE a.id = ${params.assessmentId} AND a.school_id = ${params.id}
  `
  if (!rows[0]) redirect(`/schools/${params.id}`)
  const r = rows[0] as any
  const school = { id: r.school_id, name: r.school_name, county: r.county, town: r.town, address: r.address, phone: r.phone, email: r.school_email, head_teacher: r.head_teacher, student_count: r.student_count, staff_count: r.staff_count, created_at: r.created_at, updated_at: r.updated_at }
  return <ActionPlanGenerator assessment={{ ...r, school }} school={school} />
}
