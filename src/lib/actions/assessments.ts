'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteAssessment(assessmentId: string, schoolId: string) {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['mentor', 'acsi_admin'].includes((profile as any).role)) {
    return { error: 'Forbidden' }
  }
  
  // Delete assessment
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', assessmentId)
  
  if (error) {
    return { error: error.message }
  }
  
  // Revalidate the page
  revalidatePath(`/schools/${schoolId}/assessments`)
  
  return { success: true }
}
