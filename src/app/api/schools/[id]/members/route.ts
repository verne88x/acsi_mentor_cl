import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const members = await sql`SELECT sm.id, sm.user_id, p.full_name, p.email FROM school_members sm JOIN profiles p ON p.id = sm.user_id WHERE sm.school_id = ${params.id}`
  const mentors = await sql`SELECT id, email, full_name FROM profiles WHERE role = 'mentor'`
  return NextResponse.json({ members, mentors })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { user_id } = await request.json()
  await sql`INSERT INTO school_members (school_id, user_id, role) VALUES (${params.id}, ${user_id}, 'mentor') ON CONFLICT DO NOTHING`
  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { member_id } = await request.json()
  await sql`DELETE FROM school_members WHERE id = ${member_id}`
  return NextResponse.json({ success: true })
}
