import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const notes = await sql`
    SELECT mn.*, p.full_name as mentor_name
    FROM mentor_notes mn
    JOIN profiles p ON p.id = mn.mentor_id
    WHERE mn.school_id = ${params.id}
    ORDER BY mn.visit_date DESC, mn.created_at DESC
  `
  return NextResponse.json(notes)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await request.json()
  const rows = await sql`
    INSERT INTO mentor_notes (school_id, mentor_id, visit_date, note_type, content, is_private)
    VALUES (${params.id}, ${(session.user as any).id}, ${body.visit_date}, ${body.note_type}, ${body.content}, ${body.is_private || false})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
