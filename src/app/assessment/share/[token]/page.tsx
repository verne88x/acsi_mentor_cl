import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import PublicAssessmentForm from '@/components/PublicAssessmentForm'

export default async function SharedAssessmentPage({
  params,
}: {
  params: { token: string }
}) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Look up the link by token
  const { data: link, error } = await supabaseAdmin
    .from('assessment_links')
    .select('*, school:schools(*)')
    .eq('token', params.token)
    .single()

  if (error || !link) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Link not found</h1>
        <p style={{ color: '#6b7280' }}>This assessment link is invalid or has expired.</p>
      </div>
    )
  }

  // Check if expired
  if (new Date(link.expires_at) < new Date()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Link expired</h1>
        <p style={{ color: '#6b7280' }}>This assessment link has expired. Please contact your mentor for a new link.</p>
      </div>
    )
  }

  return (
    <PublicAssessmentForm
      school={(link as any).school}
      linkId={link.id}
      token={params.token}
    />
  )
}
