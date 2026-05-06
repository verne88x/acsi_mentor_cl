import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { status } = await request.json()
  await sql`UPDATE action_items SET status=${status}, completed_date=${status==="completed"?new Date().toISOString().split("T")[0]:null} WHERE id = ${params.id}`
  return NextResponse.json({ success: true })
}
