'use server'
import { auth } from '@/auth'
import sql from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deleteAssessment(assessmentId: string, schoolId: string) {
  const session = await auth()
  if (!session?.user) return { error: 'Unauthorized' }
  const role = (session.user as any).role
  if (!['mentor', 'acsi_admin'].includes(role)) return { error: 'Forbidden' }
  await sql`DELETE FROM assessments WHERE id = ${assessmentId}`
  revalidatePath(`/schools/${schoolId}/assessments`)
  return { success: true }
}
