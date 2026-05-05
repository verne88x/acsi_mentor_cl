import sql from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AssessmentForm from "@/components/AssessmentForm"

export default async function AssessmentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (users: id, name, username, password, role (student/parent), klasse) redirect("/login")
  const rows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  return <AssessmentForm school={rows[0] as any} userId={user.id} />
}
