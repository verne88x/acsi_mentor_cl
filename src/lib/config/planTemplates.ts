import { PlanTemplates, DomainCode } from '@/types'

/**
 * Action Plan Templates
 * 
 * Pre-configured action plan templates based on assessment domains.
 * These are suggested starting points that can be customized by mentors.
 * 
 * Each template includes:
 * - Title: Focus area
 * - Actions: Specific steps to take
 * - KPIs: Measurable success indicators
 * - Owners: Suggested responsible parties
 */

export const PLAN_TEMPLATES: PlanTemplates = {
  LEADERSHIP: {
    title: 'Strengthen leadership routines and accountability',
    actions: [
      'Clarify 3 school priorities for the next 90 days and communicate to all staff',
      'Introduce weekly leadership check-ins with follow-up list (owners + deadlines)',
      'Start monthly classroom observation and feedback cycle',
    ],
    kpis: [
      'Weekly leadership meeting minutes exist for 8/12 weeks',
      'At least 2 observations per teacher completed in 90 days',
      'Staff can state the 3 priorities (spot check)',
    ],
    owners: ['Headteacher', 'Deputy Headteacher'],
  },

  TEACHING: {
    title: 'Improve lesson preparation and classroom practice',
    actions: [
      'Introduce a simple lesson plan template and require weekly submission',
      'Run 2 peer-observation/coaching rounds using a short checklist',
      'Agree on minimum standards for assessment and feedback',
    ],
    kpis: [
      '80% of lesson plans submitted weekly',
      '2 coaching rounds completed per teacher',
      'Learner exercise books show feedback in 3 subjects',
    ],
    owners: ['Academic Dean', 'Deputy Headteacher'],
  },

  GOVERNANCE: {
    title: 'Clarify governance roles and implement key policies',
    actions: [
      'Agree Board vs. school leadership roles and document decisions',
      'Approve/update 3 key policies (finance, HR, safeguarding) and communicate',
      'Set a monthly governance review (actions + follow-up)',
    ],
    kpis: [
      'Policies approved and signed',
      'Board minutes show follow-up actions monthly',
      'Staff sign they received key policies',
    ],
    owners: ['Board Chair', 'Headteacher'],
  },

  CHILD_PROTECTION: {
    title: 'Strengthen safeguarding and reporting practice',
    actions: [
      'Refresh safeguarding policy and reporting flow; display it visibly',
      'Run staff training session on reporting and boundaries',
      'Introduce supervision routines for breaks and dismissal time',
    ],
    kpis: [
      '100% staff trained and signed attendance',
      'Reporting pathway posted in 3 visible locations',
      'Supervision rota used daily for 90 days',
    ],
    owners: ['Safeguarding Lead', 'Headteacher'],
  },

  FINANCE: {
    title: 'Improve budgeting and financial record-keeping',
    actions: [
      'Create a simple monthly budget tracker (planned vs. actual)',
      'Standardize receipt and cashbook process; weekly reconciliation',
      'Agree a fee arrears procedure and apply consistently',
    ],
    kpis: [
      'Monthly reconciliation completed for 3 months',
      'Budget tracker updated monthly',
      'Arrears reduced by X% (baseline vs. end)',
    ],
    owners: ['Bursar', 'Headteacher'],
  },

  SPIRITUAL: {
    title: 'Strengthen spiritual formation routines',
    actions: [
      'Create a term plan for devotions/Bible teaching (themes, schedule)',
      'Agree on 3 culture practices (language, discipline, relationships) to reinforce',
      'Hold a monthly staff reflection/prayer meeting',
    ],
    kpis: [
      'Devotion plan exists and is followed weekly',
      'Monthly staff reflection held 3 times',
      'Student behaviour incidents reduce in 90 days (baseline vs. end)',
    ],
    owners: ['Chaplain', 'Headteacher'],
  },
}

/**
 * Get template for a specific domain
 */
export function getTemplate(domainCode: DomainCode) {
  return PLAN_TEMPLATES[domainCode]
}

/**
 * Generate action items from domain scores
 * Returns domains that need attention (score < 4)
 */
export function getPriorityDomains(
  responses: Record<string, { score: number }>
): DomainCode[] {
  return Object.entries(responses)
    .filter(([_, data]) => data.score < 4)
    .sort(([_, a], [__, b]) => a.score - b.score)
    .map(([code]) => code as DomainCode)
}

/**
 * Generate suggested action items based on assessment
 */
export interface SuggestedActionItem {
  domain: DomainCode
  description: string
  owner_name: string
  kpi: string
  priority: 1 | 2 | 3
}

export function generateSuggestedActions(
  responses: Record<string, { score: number }>
): SuggestedActionItem[] {
  const priorityDomains = getPriorityDomains(responses)
  const actions: SuggestedActionItem[] = []

  priorityDomains.forEach((domainCode, index) => {
    const template = getTemplate(domainCode)
    if (!template) return

    const priority = index < 2 ? 1 : index < 4 ? 2 : 3

    // Add actions from template
    template.actions.forEach((action, actionIndex) => {
      actions.push({
        domain: domainCode,
        description: action,
        owner_name: template.owners[actionIndex % template.owners.length] || template.owners[0],
        kpi: template.kpis[actionIndex] || '',
        priority,
      })
    })
  })

  return actions
}
