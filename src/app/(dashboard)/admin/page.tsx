import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import sql from '@/lib/db'
import { detectRiskAlerts } from '@/lib/config/riskAlerts'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'acsi_admin') redirect('/mentor')
  const schools = await sql`SELECT * FROM schools ORDER BY name`
  const alerts = await detectRiskAlerts()
  const requests = await sql`
    SELECT cr.*, s.name as school_name, s.town, s.county, p.full_name as creator_name, p.email as creator_email
    FROM consulting_requests cr JOIN schools s ON s.id = cr.school_id JOIN profiles p ON p.id = cr.created_by
    ORDER BY cr.created_at DESC
  `
  let totalScore = 0, assessmentCount = 0
  const countyStats: Record<string, any> = {}
  for (const school of schools) {
    const county = (school as any).county || 'Unknown'
    if (!countyStats[county]) countyStats[county] = { count: 0, totalScore: 0, assessmentCount: 0 }
    countyStats[county].count++
    const rows = await sql`SELECT overall_score FROM assessments WHERE school_id = ${(school as any).id} AND status = 'completed' ORDER BY assessment_date DESC LIMIT 1`
    if (rows[0]?.overall_score) { totalScore += rows[0].overall_score; assessmentCount++; countyStats[county].totalScore += rows[0].overall_score; countyStats[county].assessmentCount++ }
  }
  const stats = { totalSchools: schools.length, averageScore: assessmentCount > 0 ? (totalScore/assessmentCount).toFixed(1) : '0', totalAlerts: alerts.length, highAlerts: alerts.filter(a => a.severity === 'high').length, pendingRequests: requests.filter((r: any) => r.status === 'pending').length, schoolsWithAssessments: assessmentCount, countyStats, mentorStats: {} }
  return <AdminDashboard schools={schools} alerts={alerts} requests={requests} stats={stats} />
}
