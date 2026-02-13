import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ActionPlanGenerator from '@/components/ActionPlanGenerator'
import { Assessment, School } from '@/types'

interface AssessmentWithSchool extends Assessment {
  school: School
}

export default async function ActionPlanPage({
  params,
}: {
  params: { id: string; assessmentId: string }
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      school:schools(*)
    `)
    .eq('id', params.assessmentId)
    .eq('school_id', params.id)
    .single()

  if (error || !data) {
    redirect(`/schools/${params.id}`)
  }

  const assessment = data as unknown as AssessmentWithSchool
  
  if (!assessment.school) {
    redirect(`/schools/${params.id}`)
  }

  return (
    <ActionPlanGenerator
      assessment={assessment}
      school={assessment.school}
    />
  )
}
