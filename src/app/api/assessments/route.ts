import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const rows = await sql`
    INSERT INTO assessments (school_id, conducted_by, assessment_date, status, responses, overall_score, notes)
    VALUES (${body.school_id}, ${session.user.id}, ${body.assessment_date}, ${body.status||'completed'}, ${JSON.stringify(body.responses)}, ${body.overall_score||null}, ${body.notes||null})
    RETURNING *
  `
  return NextResponse.json(rows[0])
}
