import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const items = await request.json()
  if (Array.isArray(items) && items.length > 0) {
    for (const item of items) {
      await sql`INSERT INTO action_items (plan_id, domain, description, owner_name, kpi, priority, status, due_date) VALUES (${item.plan_id}, ${item.domain}, ${item.description}, ${item.owner_name||null}, ${item.kpi||null}, ${item.priority||null}, ${item.status||'pending'}, ${item.due_date||null})`
    }
  }
  return NextResponse.json({ success: true })
}
