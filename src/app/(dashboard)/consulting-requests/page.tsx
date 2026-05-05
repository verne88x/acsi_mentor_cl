import sql from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ConsultingRequestsPage() {
  const user = await getCurrentUser()
  if (!user || !['mentor', 'acsi_admin'].includes(user.role)) redirect('/login')
  const requests = await sql`
    SELECT cr.*, s.name as school_name, s.town, s.county, p.full_name as creator_name, p.email as creator_email
    FROM consulting_requests cr JOIN schools s ON s.id = cr.school_id JOIN profiles p ON p.id = cr.created_by
    ORDER BY cr.created_at DESC
  `
  const getColor = (s: string) => ({pending:'#eab308',reviewed:'#3b82f6',contacted:'#8b5cf6',completed:'#22c55e'} as any)[s]||'#6b7280'
  return (
    <div style={{maxWidth: '1400px', margin: '0 auto', padding: '2rem'}}>
      <div style={{background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
        <h1 style={{fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem'}}>Consultation Requests</h1>
        {requests.length === 0 ? <p style={{color: '#6b7280', textAlign: 'center', padding: '2rem'}}>No requests yet.</p> : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {requests.map((r: any) => (
              <Link key={r.id} href={`/consulting-requests/${r.id}`} style={{display: 'block', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit'}}>
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <div><h3 style={{margin: '0 0 0.5rem 0', fontWeight: 600}}>{r.school_name}</h3><div style={{fontSize: '0.875rem', color: '#6b7280'}}>{r.town}, {r.county} · {new Date(r.created_at).toLocaleDateString()}</div></div>
                  <span style={{padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: `${getColor(r.status)}20`, color: getColor(r.status), alignSelf: 'flex-start'}}>{r.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
