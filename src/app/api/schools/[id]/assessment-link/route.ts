import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await sql`INSERT INTO assessment_links (school_id, created_by) VALUES (${params.id}, ${(session.user as any).id}) RETURNING token`
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mentor.acsi.pro"
  return NextResponse.json({ link: `${appUrl}/assessment/share/${rows[0].token}`, token: rows[0].token })
}
