import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await request.json()
  const { school_id, assessment_link_id, respondent_name, respondent_role, responses, overall_score } = body

  if (!school_id || !respondent_name || !respondent_role || !responses) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('assessments')
    .insert({
      school_id,
      assessment_link_id,
      respondent_name,
      respondent_role,
      responses,
      overall_score,
      status: 'completed',
      assessment_date: new Date().toISOString().split('T')[0],
      conducted_by: null, // no logged-in user
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, id: (data as any).id })
}
