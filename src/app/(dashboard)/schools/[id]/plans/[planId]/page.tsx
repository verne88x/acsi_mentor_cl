import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ActionPlanView from '@/components/ActionPlanView'

export default async function ActionPlanDetailPage({
  params,
}: {
  params: { id: string; planId: string }
}) {
  const supabase = await createClient()

  // Get action plan with items
  const { data: planData, error } = await supabase
    .from('action_plans')
    .select(`
      *,
      school:schools(*),
      action_items(*),
      creator:profiles!created_by(full_name, email)
    `)
    .eq('id', params.planId)
    .eq('school_id', params.id)
    .single()

  if (error || !planData) {
    redirect(`/schools/${params.id}/plans`)
  }

  const plan = planData as any

  return (
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '2rem' 
    }}>
      <Link 
        href={`/schools/${params.id}/plans`}
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
        ← Back to Action Plans
      </Link>

      <ActionPlanView plan={plan} />
    </div>
  )
}
