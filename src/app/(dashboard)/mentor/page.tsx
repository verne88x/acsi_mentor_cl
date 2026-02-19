import { redirect } from 'next/navigation'
import { getCurrentUser, getUserSchools } from '@/lib/auth'
import { detectRiskAlerts } from '@/lib/config/riskAlerts'
import { createClient } from '@/lib/supabase/server'
import TabbedMentorDashboard from '@/components/TabbedMentorDashboard'

export default async function MentorDashboard() {
  const user = await getCurrentUser()
  
  if (!user || (user.role !== 'mentor' && user.role !== 'acsi_admin')) {
    redirect('/login')
  }

  const supabase = await createClient()
  const schools = await getUserSchools()
  const alerts = await detectRiskAlerts()
  
  // Get consultation requests
  const { data: requestsData } = await supabase
    .from('consulting_requests')
    .select(`
      *,
      school:schools(name, town, county),
      creator:profiles!created_by(full_name, email)
    `)
    .order('created_at', { ascending: false })
  
  const requests = (requestsData as any) || []
  
  // Calculate overview stats
  const totalSchools = schools.length
  
  // Get average overall score across all latest assessments
  let totalScore = 0
  let assessmentCount = 0
  
  for (const school of schools) {
    const { data: latestAssessment } = await supabase
      .from('assessments')
      .select('overall_score')
      .eq('school_id', (school as any).id)
      .eq('status', 'completed')
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single()
    
    if (latestAssessment && (latestAssessment as any).overall_score) {
      totalScore += (latestAssessment as any).overall_score
      assessmentCount++
    }
  }
  
  const averageScore = assessmentCount > 0 ? totalScore / assessmentCount : 0
  
  // Count pending consultation requests
  const pendingRequests = requests.filter((r: any) => r.status === 'pending').length
  
  const stats = {
    totalSchools,
    averageScore: averageScore.toFixed(1),
    highAlerts: alerts.filter(a => a.severity === 'high').length,
    pendingRequests
  }

  return (
    <TabbedMentorDashboard 
      schools={schools} 
      alerts={alerts}
      requests={requests}
      stats={stats}
    />
  )
}
