import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const b = await request.json()
  const rows = await sql`INSERT INTO action_plans (school_id, assessment_id, created_by, title, description, start_date, end_date, status) VALUES (${b.school_id}, ${b.assessment_id||null}, ${(session.user as any).id}, ${b.title}, ${b.description||null}, ${b.start_date||null}, ${b.end_date||null}, ${b.status||"active"}) RETURNING *`
  return NextResponse.json(rows[0])
}
