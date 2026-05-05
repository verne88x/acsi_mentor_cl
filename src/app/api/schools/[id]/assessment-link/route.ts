import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import sql from '@/lib/db'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['mentor','acsi_admin'].includes((session.user as any).role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const rows = await sql`INSERT INTO assessment_links (school_id, created_by) VALUES (${params.id}, ${session.user.id}) RETURNING token`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://mentor.acsi.pro'
  return NextResponse.json({ link: `${appUrl}/assessment/share/${rows[0].token}`, token: rows[0].token })
}
