import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'acsi_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const b = await request.json()
  const rows = await sql`INSERT INTO schools (name, county, town, address, phone, email, head_teacher, student_count, staff_count) VALUES (${b.name}, ${b.county||null}, ${b.town||null}, ${b.address||null}, ${b.phone||null}, ${b.email||null}, ${b.head_teacher||null}, ${b.student_count||null}, ${b.staff_count||null}) RETURNING id`
  return NextResponse.json({ id: rows[0].id })
}
