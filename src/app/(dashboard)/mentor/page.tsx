import { redirect } from 'next/navigation'
import { getCurrentUser, getUserSchools } from '@/lib/auth'
import { detectRiskAlerts } from '@/lib/config/riskAlerts'
import sql from '@/lib/db'
import TabbedMentorDashboard from '@/components/TabbedMentorDashboard'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth'

export default async function MentorDashboard() {
  const session = await getServerSession(authOptions)
  const user = await getCurrentUser()
  if (!user || !['mentor', 'acsi_admin', 'regional_manager'].includes(user.role)) redirect('/login')
  const schools = await getUserSchools()
  const profile = await sql`SELECT region FROM profiles WHERE id = ${(session?.user as any)?.id}`
  const userRegion = profile[0]?.region || null
  const alerts = await detectRiskAlerts(userRegion)
  const requests = await sql`
    SELECT cr.*, s.name as school_name, s.town, s.county, p.full_name as creator_name, p.email as creator_email
    FROM consulting_requests cr JOIN schools s ON s.id = cr.school_id JOIN profiles p ON p.id = cr.created_by
    ORDER BY cr.created_at DESC
  `
  let totalScore = 0, assessmentCount = 0
  for (const school of schools) {
    const rows = await sql`SELECT overall_score FROM assessments WHERE school_id = ${(school as any).id} AND status = 'completed' ORDER BY assessment_date DESC LIMIT 1`
    if (rows[0]?.overall_score) { totalScore += parseFloat(String(rows[0].overall_score)); assessmentCount++ }
  }
  const stats = { totalSchools: schools.length, averageScore: assessmentCount > 0 ? parseFloat(String(totalScore/assessmentCount)).toFixed(1) : 'N/A', highAlerts: alerts.filter(a => a.severity === 'high').length, pendingRequests: requests.filter((r: any) => r.status === 'pending').length }
  return <TabbedMentorDashboard schools={schools} alerts={alerts} requests={requests} stats={stats} />
}
