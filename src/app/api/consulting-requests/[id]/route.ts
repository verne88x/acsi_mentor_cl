import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { status } = await request.json()
  await sql`UPDATE consulting_requests SET status=${status} WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
