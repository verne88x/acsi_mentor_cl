import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function DELETE(request: Request, { params }: { params: { id: string; noteId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await sql`DELETE FROM mentor_notes WHERE id = ${params.noteId} AND mentor_id = ${(session.user as any).id}`
  return NextResponse.json({ success: true })
}
