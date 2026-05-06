'use server'
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function deleteAssessment(assessmentId: string, schoolId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: "Unauthorized" }
  await sql`DELETE FROM assessments WHERE id = ${assessmentId}`
  revalidatePath(`/schools/${schoolId}/assessments`)
  return { success: true }
}
