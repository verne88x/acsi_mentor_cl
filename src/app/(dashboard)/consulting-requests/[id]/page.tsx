import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ConsultingRequestDetail from '@/components/ConsultingRequestDetail'

export default async function ConsultingRequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  // Check if user is mentor
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['mentor', 'acsi_admin'].includes(profile.role)) {
    redirect('/mentor')
  }

  // Get consulting request
  const { data: requestData, error } = await supabase
    .from('consulting_requests')
    .select(`
      *,
      school:schools(*),
      creator:profiles!created_by(full_name, email)
    `)
    .eq('id', params.id)
    .single()

  if (error || !requestData) {
    redirect('/consulting-requests')
  }

  const request = requestData as any

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      <Link 
        href="/consulting-requests"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#3b82f6',
          textDecoration: 'none',
          marginBottom: '2rem',
          fontSize: '0.875rem'
        }}
      >
        ← Back to All Requests
      </Link>

      <ConsultingRequestDetail request={request} />
    </div>
  )
}
