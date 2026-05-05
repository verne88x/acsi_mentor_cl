import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'acsi_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await sql`SELECT id, email, full_name, role, created_at FROM profiles ORDER BY created_at DESC`
  return NextResponse.json(users)
}
