import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
  await sql`
    INSERT INTO consultation_links (school_id, created_by, token, expires_at)
    VALUES (${params.id}, ${(session.user as any).id}, ${token}, NOW() + INTERVAL '30 days')
  `
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mentor.acsi.pro"
  return NextResponse.json({ link: \`\${appUrl}/consultation/share/\${token}\` })
}
