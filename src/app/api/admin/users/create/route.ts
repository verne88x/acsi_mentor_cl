import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user as any).role !== "acsi_admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { email, password, full_name, role } = await request.json()
  const hash = await bcrypt.hash(password, 12)
  const rows = await sql`WITH new_user AS (INSERT INTO users (email, password_hash) VALUES (${email}, ${hash}) RETURNING id) INSERT INTO profiles (id, email, full_name, role) SELECT id, ${email}, ${full_name}, ${role} FROM new_user RETURNING id`
  return NextResponse.json({ success: true, id: rows[0].id })
}
