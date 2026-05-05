import sql from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ActionPlansPage({ params }: { params: { id: string } }) {
  const rows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  if (!rows[0]) redirect('/mentor')
  const school = rows[0] as any
  const plans = await sql`SELECT ap.*, (SELECT COUNT(*) FROM action_items ai WHERE ai.plan_id = ap.id) as item_count FROM action_plans ap WHERE ap.school_id = ${params.id} ORDER BY ap.created_at DESC`
  const getColor = (s: string) => ({active:'#22c55e',completed:'#3b82f6',archived:'#6b7280'} as any)[s]||'#eab308'
  return (
    <div style={{maxWidth: '1200px', margin: '0 auto', padding: '2rem'}}>
      <Link href={`/schools/${params.id}`} style={{color: '#3b82f6', textDecoration: 'none', marginBottom: '2rem', display: 'block'}}>← Back to School</Link>
      <div style={{background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0'}}>Action Plans</h1>
        <p style={{color: '#6b7280', margin: '0 0 2rem 0'}}>{school.name}</p>
        {plans.length === 0 ? (
          <div style={{textAlign: 'center', padding: '3rem', color: '#6b7280'}}>
            <p>No action plans yet.</p>
            <Link href={`/schools/${params.id}/assessment`} style={{display: 'inline-block', marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3b82f6', color: 'white', borderRadius: '6px', textDecoration: 'none'}}>New Assessment</Link>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {plans.map((plan: any) => (
              <Link key={plan.id} href={`/schools/${params.id}/plans/${plan.id}`} style={{display: 'block', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div><h3 style={{margin: '0 0 0.5rem 0', fontWeight: 600}}>{plan.title}</h3><span style={{fontSize: '0.875rem', color: '#9ca3af'}}>{new Date(plan.created_at).toLocaleDateString()}</span></div>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem'}}>
                    <span style={{padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: `${getColor(plan.status)}20`, color: getColor(plan.status)}}>{plan.status}</span>
                    <span style={{fontSize: '0.875rem', color: '#6b7280'}}>{plan.item_count} items</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
