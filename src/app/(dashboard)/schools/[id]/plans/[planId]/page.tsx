import sql from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActionPlanView from '@/components/ActionPlanView'

export default async function ActionPlanDetailPage({ params }: { params: { id: string; planId: string } }) {
  const rows = await sql`
    SELECT ap.*, s.id as school_id, s.name as school_name, s.county, s.town,
           p.full_name as creator_name, p.email as creator_email,
           (SELECT json_agg(ai.* ORDER BY ai.created_at) FROM action_items ai WHERE ai.plan_id = ap.id) as action_items
    FROM action_plans ap JOIN schools s ON s.id = ap.school_id LEFT JOIN profiles p ON p.id = ap.created_by
    WHERE ap.id = ${params.planId} AND ap.school_id = ${params.id}
  `
  if (!rows[0]) redirect(`/schools/${params.id}/plans`)
  const r = rows[0] as any
  const plan = { ...r, school: { id: r.school_id, name: r.school_name, county: r.county, town: r.town }, creator: { full_name: r.creator_name, email: r.creator_email }, action_items: r.action_items || [] }
  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
      <Link href={`/schools/${params.id}/plans`} style={{color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block'}}>← Back to Action Plans</Link>
      <ActionPlanView plan={plan} />
    </div>
  )
}
