import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "acsi_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const visits = await sql`
    SELECT mn.id, mn.visit_date, mn.note_type, mn.content, mn.created_at,
           p.full_name as mentor_name, p.id as mentor_id,
           s.id as school_id, s.name as school_name, s.county, s.town
    FROM mentor_notes mn
    JOIN profiles p ON p.id = mn.mentor_id
    JOIN schools s ON s.id = mn.school_id
    WHERE mn.is_private = false
    ORDER BY mn.visit_date DESC, mn.created_at DESC
    LIMIT 100
  `

  const mentorStats = await sql`
    SELECT p.id, p.full_name, p.email,
           COUNT(DISTINCT mn.id) as total_visits,
           COUNT(DISTINCT mn.school_id) as schools_visited,
           MAX(mn.visit_date) as last_visit,
           COUNT(DISTINCT a.id) as total_assessments
    FROM profiles p
    LEFT JOIN mentor_notes mn ON mn.mentor_id = p.id AND mn.is_private = false
    LEFT JOIN assessments a ON (a.conducted_by = p.id OR (p.region IS NOT NULL AND EXISTS (SELECT 1 FROM schools s WHERE s.id = a.school_id AND s.region = p.region)))
    WHERE p.role IN ('mentor', 'acsi_admin', 'regional_manager')
    GROUP BY p.id, p.full_name, p.email
    ORDER BY total_visits DESC
  `

  return NextResponse.json({ visits, mentorStats })
}
