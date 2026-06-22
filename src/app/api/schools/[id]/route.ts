import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const rows = await sql`SELECT * FROM schools WHERE id = ${params.id}`
  return NextResponse.json(rows[0] || null)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const b = await request.json()
  await sql`UPDATE schools SET name=${b.name}, county=${b.county||null}, town=${b.town||null}, address=${b.address||null}, phone=${b.phone||null}, email=${b.email||null}, head_teacher=${b.head_teacher||null}, student_count=${b.student_count||null}, staff_count=${b.staff_count||null}, region=${b.region||null} WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
