import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { detectRiskAlerts } from '@/lib/config/riskAlerts'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'acsi_admin') {
    redirect('/mentor')
  }

  const supabase = await createClient()
  
  // Get ALL schools (not just assigned)
  const { data: schoolsData } = await supabase
    .from('schools')
    .select('*')
    .order('name', { ascending: true })
  
  const schools = (schoolsData as any) || []
  
  // Get mentor info separately for schools that have one
  for (const school of schools) {
    if (school.mentor_id) {
      const { data: mentor } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', school.mentor_id)
        .single()
      school.mentor = mentor
    }
  }
  
  // Get ALL alerts
  const alerts = await detectRiskAlerts()
  
  // Get ALL consultation requests
  const { data: requestsData } = await supabase
    .from('consulting_requests')
    .select(`
      *,
      school:schools(name, town, county),
      creator:profiles!created_by(full_name, email)
    `)
    .order('created_at', { ascending: false })
  
  const requests = (requestsData as any) || []
  
  // Calculate network stats
  let totalScore = 0
  let assessmentCount = 0
  const countyStats: Record<string, { count: number, totalScore: number, assessmentCount: number }> = {}
  
  for (const school of schools) {
    const county = school.county || 'Unknown'
    
    if (!countyStats[county]) {
      countyStats[county] = { count: 0, totalScore: 0, assessmentCount: 0 }
    }
    countyStats[county].count++
    
    const { data: latestAssessment } = await supabase
      .from('assessments')
      .select('overall_score')
      .eq('school_id', school.id)
      .eq('status', 'completed')
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single()
    
    if (latestAssessment && (latestAssessment as any).overall_score) {
      const score = (latestAssessment as any).overall_score
      totalScore += score
      assessmentCount++
      countyStats[county].totalScore += score
      countyStats[county].assessmentCount++
    }
  }
  
  const averageScore = assessmentCount > 0 ? totalScore / assessmentCount : 0
  
  // Get mentor assignments
  const mentorStats: Record<string, { name: string, schoolCount: number }> = {}
  
  for (const school of schools) {
    if (school.mentor) {
      const mentorId = school.mentor_id
      if (!mentorStats[mentorId]) {
        mentorStats[mentorId] = {
          name: school.mentor.full_name || school.mentor.email,
          schoolCount: 0
        }
      }
      mentorStats[mentorId].schoolCount++
    }
  }
  
  const stats = {
    totalSchools: schools.length,
    averageScore: averageScore.toFixed(1),
    totalAlerts: alerts.length,
    highAlerts: alerts.filter(a => a.severity === 'high').length,
    pendingRequests: requests.filter((r: any) => r.status === 'pending').length,
    schoolsWithAssessments: assessmentCount,
    countyStats,
    mentorStats
  }

  return (
    <AdminDashboard 
      schools={schools}
      alerts={alerts}
      requests={requests}
      stats={stats}
    />
  )
}
