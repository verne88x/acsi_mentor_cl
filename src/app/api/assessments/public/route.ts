import { NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(request: Request) {
  const body = await request.json()
  const { school_id, assessment_link_id, respondent_name, respondent_role, responses, overall_score } = body
  if (!school_id || !respondent_name || !respondent_role || !responses)
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  const cb = await sql`SELECT id FROM profiles LIMIT 1`
  const rows = await sql`
    INSERT INTO assessments (school_id, assessment_link_id, respondent_name, respondent_role, responses, overall_score, status, assessment_date, conducted_by)
    VALUES (${school_id}, ${assessment_link_id||null}, ${respondent_name}, ${respondent_role}, ${JSON.stringify(responses)}, ${overall_score||null}, 'completed', CURRENT_DATE, ${cb[0].id})
    RETURNING id
  `
  return NextResponse.json({ success: true, id: rows[0].id })
}
