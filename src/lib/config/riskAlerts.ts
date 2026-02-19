import { createClient } from '@/lib/supabase/server'
import { HEALTH_CHECK_DOMAINS } from './healthCheckConfig'

export interface RiskAlert {
  id: string
  school_id: string
  school_name: string
  type: 'no_recent_assessment' | 'low_standard' | 'declining_score' | 'no_action_plan'
  severity: 'high' | 'medium' | 'low'
  message: string
  details?: any
  created_at: Date
}

export async function detectRiskAlerts(): Promise<RiskAlert[]> {
  const supabase = await createClient()
  const alerts: RiskAlert[] = []
  
  // Get all schools
  const { data: schools } = await supabase
    .from('schools')
    .select('*')
  
  if (!schools) return alerts
  
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  
  for (const school of schools) {
    // Get latest assessment
    const { data: latestAssessment } = await supabase
      .from('assessments')
      .select('*')
      .eq('school_id', school.id)
      .eq('status', 'completed')
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single()
    
    // ALERT 1: No recent assessment (6+ months)
    if (!latestAssessment) {
      alerts.push({
        id: `${school.id}-no-assessment`,
        school_id: school.id,
        school_name: school.name,
        type: 'no_recent_assessment',
        severity: 'high',
        message: 'No assessment on record',
        created_at: new Date()
      })
    } else {
      const assessmentDate = new Date(latestAssessment.assessment_date)
      if (assessmentDate < sixMonthsAgo) {
        const monthsAgo = Math.floor((Date.now() - assessmentDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
        alerts.push({
          id: `${school.id}-no-recent`,
          school_id: school.id,
          school_name: school.name,
          type: 'no_recent_assessment',
          severity: monthsAgo > 12 ? 'high' : 'medium',
          message: `Last assessment ${monthsAgo} months ago`,
          details: { last_assessment_date: latestAssessment.assessment_date },
          created_at: new Date()
        })
      }
      
      // ALERT 2: Standards under 2.0
      if (latestAssessment) {
        const lowStandards: string[] = []
        HEALTH_CHECK_DOMAINS.forEach(domain => {
          const response = latestAssessment.responses[domain.code]
          if (response && response.score < 2.0) {
            lowStandards.push(`${domain.label} (${response.score.toFixed(1)})`)
          }
        })
        
        if (lowStandards.length > 0) {
          alerts.push({
            id: `${school.id}-low-standards`,
            school_id: school.id,
            school_name: school.name,
            type: 'low_standard',
            severity: lowStandards.length >= 3 ? 'high' : 'medium',
            message: `${lowStandards.length} standard${lowStandards.length > 1 ? 's' : ''} below 2.0`,
            details: { standards: lowStandards },
            created_at: new Date()
          })
        }
      }
      
      // ALERT 3: Declining overall score
      const { data: previousAssessment } = await supabase
        .from('assessments')
        .select('*')
        .eq('school_id', school.id)
        .eq('status', 'completed')
        .order('assessment_date', { ascending: false })
        .limit(1)
        .range(1, 1)
        .single()
      
      if (latestAssessment && previousAssessment) {
        const currentScore = latestAssessment.overall_score || 0
        const previousScore = previousAssessment.overall_score || 0
        const decline = previousScore - currentScore
        
        if (decline > 0.3) {
          alerts.push({
            id: `${school.id}-declining`,
            school_id: school.id,
            school_name: school.name,
            type: 'declining_score',
            severity: decline > 0.5 ? 'high' : 'medium',
            message: `Overall score declined by ${decline.toFixed(1)} points`,
            details: { 
              previous: previousScore.toFixed(1), 
              current: currentScore.toFixed(1) 
            },
            created_at: new Date()
          })
        }
      }
    }
    
    // ALERT 4: No active action plan
    const { data: activePlans } = await supabase
      .from('action_plans')
      .select('id')
      .eq('school_id', school.id)
      .eq('status', 'active')
    
    if (!activePlans || activePlans.length === 0) {
      // Only alert if they have a recent assessment but no plan
      if (latestAssessment) {
        const assessmentDate = new Date(latestAssessment.assessment_date)
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        
        if (assessmentDate > oneMonthAgo) {
          alerts.push({
            id: `${school.id}-no-plan`,
            school_id: school.id,
            school_name: school.name,
            type: 'no_action_plan',
            severity: 'low',
            message: 'Recent assessment but no active action plan',
            created_at: new Date()
          })
        }
      }
    }
  }
  
  // Sort by severity
  return alerts.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    return severityOrder[a.severity] - severityOrder[b.severity]
  })
}

export function getSeverityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#eab308'
  }
}

export function getSeverityBgColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high': return '#fee2e2'
    case 'medium': return '#fed7aa'
    case 'low': return '#fef9c3'
  }
}

export function getAlertIcon(type: RiskAlert['type']): string {
  switch (type) {
    case 'no_recent_assessment': return '📅'
    case 'low_standard': return '⚠️'
    case 'declining_score': return '📉'
    case 'no_action_plan': return '📋'
    default: return '🔔'
  }
}
