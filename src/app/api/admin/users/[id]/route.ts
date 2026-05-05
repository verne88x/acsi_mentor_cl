import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'acsi_admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { role } = await request.json()
  await sql`UPDATE profiles SET role = ${role} WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
