import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "acsi_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const profile = await sql`SELECT * FROM profiles WHERE id = ${params.id}`
  if (!profile[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const manager = profile[0]

  const schools = manager.region
    ? await sql`SELECT * FROM schools WHERE region = ${manager.region} ORDER BY name`
    : await sql`SELECT s.* FROM school_members sm JOIN schools s ON s.id = sm.school_id WHERE sm.user_id = ${params.id} ORDER BY s.name`

  const visits = await sql`
    SELECT mn.*, s.name as school_name, s.town, s.county
    FROM mentor_notes mn
    JOIN schools s ON s.id = mn.school_id
    WHERE mn.mentor_id = ${params.id} AND mn.is_private = false
    ORDER BY mn.visit_date DESC LIMIT 20
  `

  const stats = await sql`
    SELECT
      COUNT(DISTINCT mn.id) as total_visits,
      COUNT(DISTINCT mn.school_id) as schools_visited,
      COUNT(DISTINCT a.id) as total_assessments,
      MAX(mn.visit_date) as last_visit
    FROM profiles p
    LEFT JOIN mentor_notes mn ON mn.mentor_id = p.id
    LEFT JOIN assessments a ON a.conducted_by = p.id
    WHERE p.id = ${params.id}
  `

  return NextResponse.json({ manager, schools, visits, stats: stats[0] })
}
