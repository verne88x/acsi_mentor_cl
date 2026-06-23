import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  const schools = await sql`SELECT * FROM schools ORDER BY region NULLS LAST, name`
  return NextResponse.json(schools)
}
