import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const plans = await sql`SELECT ap.*, (SELECT json_agg(ai.*) FROM action_items ai WHERE ai.plan_id = ap.id) as items FROM action_plans ap WHERE ap.school_id = ${params.id} ORDER BY ap.created_at DESC`
  return NextResponse.json(plans)
}
