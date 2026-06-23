import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "acsi_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { password } = await request.json()
  if (!password || password.length < 6) return NextResponse.json({ error: "Password too short" }, { status: 400 })
  const hash = await bcrypt.hash(password, 12)
  await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
