import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const b = await request.json()
  const rows = await sql`INSERT INTO consulting_requests (school_id, created_by, contact_person, contact_phone, contact_email, timeline, consultation_type, current_situation, specific_needs, previous_support, goals, additional_info) VALUES (${b.school_id}, ${session.user.id}, ${b.contact_person||null}, ${b.contact_phone||null}, ${b.contact_email||null}, ${b.timeline||null}, ${b.consultation_type||null}, ${b.current_situation||null}, ${b.specific_needs||null}, ${b.previous_support||null}, ${b.goals||null}, ${b.additional_info||null}) RETURNING id`
  return NextResponse.json({ id: rows[0].id })
}
