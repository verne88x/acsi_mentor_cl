import sql from "@/lib/db"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = await request.json()
  const { school_id, token, contact_person, contact_phone, contact_email, current_situation, specific_needs, goals, additional_info } = body

  // Verify token is valid
  const links = await sql\`SELECT * FROM consultation_links WHERE token = \${token}\`
  if (!links[0]) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

  const link = links[0] as any

  await sql\`
    INSERT INTO consulting_requests (school_id, created_by, contact_person, contact_phone, contact_email, current_situation, specific_needs, goals, additional_info, status)
    VALUES (\${school_id}, \${link.created_by}, \${contact_person||null}, \${contact_phone||null}, \${contact_email||null}, \${current_situation||null}, \${specific_needs||null}, \${goals||null}, \${additional_info||null}, 'pending')
  \`

  return NextResponse.json({ success: true })
}
