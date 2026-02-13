import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActionPlanGenerator from '@/components/ActionPlanGenerator'

export default async function ActionPlanPage({
  params,
}: {
  params: { id: string; assessmentId: string }
}) {
  const supabase = await createClient()

  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      school:schools(*)
    `)
    .eq('id', params.assessmentId)
    .eq('school_id', params.id)
    .single()

  if (error || !assessment) {
    redirect(`/schools/${params.id}`)
  }

  return (
    <ActionPlanGenerator
      assessment={assessment}
      school={assessment.school}
    />
  )
}
