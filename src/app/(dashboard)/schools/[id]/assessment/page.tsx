import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AssessmentForm from '@/components/AssessmentForm'

export default async function AssessmentPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const { data: school, error } = await supabase
    .from('schools')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !school) {
    redirect('/mentor')
  }

  return <AssessmentForm school={school} userId={user.id} />
}
