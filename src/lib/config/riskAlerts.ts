import sql from '@/lib/db'
import { HEALTH_CHECK_DOMAINS } from './healthCheckConfig'

export interface RiskAlert {
  id: string; school_id: string; school_name: string
  type: 'no_recent_assessment' | 'low_standard' | 'declining_score' | 'no_action_plan'
  severity: 'high' | 'medium' | 'low'; message: string; details?: any; created_at: Date
}

export async function detectRiskAlerts(region?: string | null): Promise<RiskAlert[]> {
  const alerts: RiskAlert[] = []
  const schools = region ? await sql`SELECT * FROM schools WHERE region = ${region}` : await sql`SELECT * FROM schools`
  const sixMonthsAgo = new Date(); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  for (const school of schools) {
    const latest = (await sql`SELECT * FROM assessments WHERE school_id = ${school.id} AND status = 'completed' ORDER BY assessment_date DESC LIMIT 1`)[0]
    if (!latest) {
      alerts.push({ id: `${school.id}-no-assessment`, school_id: school.id, school_name: school.name, type: 'no_recent_assessment', severity: 'high', message: 'No assessment on record', created_at: new Date() })
    } else {
      const d = new Date(latest.assessment_date)
      if (d < sixMonthsAgo) {
        const m = Math.floor((Date.now() - d.getTime()) / (1000*60*60*24*30))
        alerts.push({ id: `${school.id}-no-recent`, school_id: school.id, school_name: school.name, type: 'no_recent_assessment', severity: m > 12 ? 'high' : 'medium', message: `Last assessment ${m} months ago`, created_at: new Date() })
      }
      const prev = (await sql`SELECT * FROM assessments WHERE school_id = ${school.id} AND status = 'completed' ORDER BY assessment_date DESC LIMIT 1 OFFSET 1`)[0]
      if (prev) {
        const decline = (prev.overall_score||0) - (latest.overall_score||0)
        if (decline > 0.3) alerts.push({ id: `${school.id}-declining`, school_id: school.id, school_name: school.name, type: 'declining_score', severity: decline > 0.5 ? 'high' : 'medium', message: `Score declined by ${decline.toFixed(1)}`, created_at: new Date() })
      }
    }
    const plans = await sql`SELECT id FROM action_plans WHERE school_id = ${school.id} AND status = 'active'`
    if (plans.length === 0 && latest) {
      const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      if (new Date(latest.assessment_date) > oneMonthAgo)
        alerts.push({ id: `${school.id}-no-plan`, school_id: school.id, school_name: school.name, type: 'no_action_plan', severity: 'low', message: 'Recent assessment but no active action plan', created_at: new Date() })
    }
  }
  return alerts.sort((a, b) => ({high:0,medium:1,low:2}[a.severity] - {high:0,medium:1,low:2}[b.severity]))
}

export function getSeverityColor(s: 'high'|'medium'|'low') { return {high:'#ef4444',medium:'#f59e0b',low:'#eab308'}[s] }
export function getSeverityBgColor(s: 'high'|'medium'|'low') { return {high:'#fee2e2',medium:'#fed7aa',low:'#fef9c3'}[s] }
export function getAlertIcon(t: RiskAlert['type']) { return {no_recent_assessment:'📅',low_standard:'⚠️',declining_score:'📉',no_action_plan:'📋'}[t]||'🔔' }
