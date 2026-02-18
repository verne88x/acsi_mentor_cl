import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ConsultingRequestsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  if (!profile || !['mentor', 'acsi_admin'].includes(profile.role)) {
    redirect('/mentor')
  }

  const { data: requests } = await supabase
    .from('consulting_requests')
    .select(`
      *,
      school:schools(name, town, county),
      creator:profiles!created_by(full_name, email)
    `)
    .order('created_at', { ascending: false })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#eab308'
      case 'reviewed': return '#3b82f6'
      case 'contacted': return '#8b5cf6'
      case 'completed': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const statusCounts = {
    pending: requests?.filter(r => r.status === 'pending').length || 0,
    reviewed: requests?.filter(r => r.status === 'reviewed').length || 0,
    contacted: requests?.filter(r => r.status === 'contacted').length || 0,
    completed: requests?.filter(r => r.status === 'completed').length || 0,
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '8px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Consultation Requests</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>All consultation requests from schools</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', background: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#eab308' }}>{statusCounts.pending}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</div>
          </div>
          <div style={{ padding: '1rem', background: '#dbeafe', borderRadius: '8px', border: '1px solid #93c5fd' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{statusCounts.reviewed}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Reviewed</div>
          </div>
          <div style={{ padding: '1rem', background: '#ede9fe', borderRadius: '8px', border: '1px solid #c4b5fd' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>{statusCounts.contacted}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Contacted</div>
          </div>
          <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#22c55e' }}>{statusCounts.completed}</div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
          </div>
        </div>

        {!requests || requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>No consultation requests yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {requests.map((request: any) => (
              <Link key={request.id} href={`/consulting-requests/${request.id}`} style={{ display: 'block', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'all 0.2s', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 0.5rem 0', color: '#111827' }}>{request.school.name}</h3>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{request.school.town}, {request.school.county}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Submitted: {new Date(request.created_at).toLocaleDateString()} by {request.creator?.full_name || request.creator?.email}</div>
                    {request.timeline && <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Timeline: {request.timeline}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', background: `${getStatusColor(request.status)}20`, color: getStatusColor(request.status) }}>{getStatusLabel(request.status)}</span>
                    {request.contact_person && <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>Contact: {request.contact_person}</div>}
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
