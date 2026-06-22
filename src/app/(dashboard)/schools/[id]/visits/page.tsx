import sql from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import VisitLogClient from "@/components/VisitLogClient"

export default async function VisitLogPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const schoolRows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  if (!schoolRows[0]) redirect("/mentor")
  const school = schoolRows[0] as any

  const notes = await sql`
    SELECT mn.*, p.full_name as mentor_name
    FROM mentor_notes mn
    JOIN profiles p ON p.id = mn.mentor_id
    WHERE mn.school_id = ${params.id}
    ORDER BY mn.visit_date DESC, mn.created_at DESC
  `

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <Link href={`/schools/${params.id}`} style={{ color: "#3b82f6", textDecoration: "none", marginBottom: "2rem", display: "block" }}>← Back to School</Link>
      <VisitLogClient school={school} initialNotes={notes} userId={(user as any).id} />
    </div>
  )
}
