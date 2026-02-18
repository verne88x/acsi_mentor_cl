import { PlanTemplates, DomainCode } from '@/types'

/**
 * PSI-BASED Action Plan Templates
 * 
 * Pre-configured action plan templates aligned with PSI Standards.
 * These are suggested starting points that can be customized by mentors.
 * 
 * Each template includes:
 * - Title: Focus area based on PSI Standard
 * - Actions: Specific steps to take
 * - KPIs: Measurable success indicators
 * - Owners: Suggested responsible parties
 */

export const PLAN_TEMPLATES: PlanTemplates = {
  FOUNDATIONS: {
    title: 'Establish clear foundational documents',
    actions: [
      'Develop and document a Statement of Faith that all staff review and sign',
      'Write a Philosophy of Christian Education that guides instructional decisions',
      'Create clear Vision, Mission, and Schoolwide Expected Student Outcomes statements',
      'Have all parents sign acknowledgment of the school\'s Christian distinctives',
    ],
    kpis: [
      '100% of staff have signed Statement of Faith',
      'Philosophy document completed and shared with all staff',
      'Vision/Mission displayed prominently in school',
      '80% of parent acknowledgments collected',
    ],
    owners: ['Headteacher', 'Board Chair', 'Leadership Team'],
  },

  LEADERSHIP: {
    title: 'Strengthen Christ-centered leadership and staff development',
    actions: [
      'Form a leadership team of 3+ that meets weekly for prayerful decision-making',
      'Create clear job descriptions for all staff positions',
      'Develop a policies and procedures manual covering key operational areas',
      'Plan and deliver quarterly professional development for all teaching staff',
    ],
    kpis: [
      'Leadership team meets weekly with documented decisions',
      'Job descriptions exist for 100% of positions',
      'Policy manual completed and shared with all staff',
      'All teachers participate in at least 2 PD sessions per term',
    ],
    owners: ['Headteacher', 'Deputy Headteacher', 'Board'],
  },

  TEACHING: {
    title: 'Develop curriculum and improve instructional quality',
    actions: [
      'Create written curriculum plans for all subjects showing biblical integration',
      'Introduce multiple forms of student assessment (not just exams)',
      'Implement regular parent communication about student progress (monthly)',
      'Review student-teacher ratios and class sizes for optimal learning',
    ],
    kpis: [
      'Curriculum plans exist for all subjects with biblical worldview integration',
      'Teachers use at least 3 different assessment methods',
      'Monthly progress reports sent to all parents',
      'Class sizes below 35 students (or school-defined target)',
    ],
    owners: ['Academic Dean', 'Department Heads', 'Teachers'],
  },

  FINANCE: {
    title: 'Improve financial stewardship, facilities, and health/safety',
    actions: [
      'Create an annual budget accounting for salaries, materials, and maintenance',
      'Organize and secure all student records (academic and medical)',
      'Develop a written health and safety plan covering illness, abuse prevention, and emergencies',
      'Achieve UNICEF WASH Two-Star standard (handwashing, toilets, water, hygiene)',
    ],
    kpis: [
      'Budget approved and tracked monthly',
      'Student records organized in locked cabinets/secure digital system',
      'Health & safety plan completed and staff trained',
      'WASH assessment shows Two-Star compliance',
    ],
    owners: ['Bursar', 'Headteacher', 'Facilities Manager'],
  },

  SPIRITUAL: {
    title: 'Strengthen spiritual formation and discipleship',
    actions: [
      'Create a written plan for spiritual nurture across all grade levels',
      'Establish daily Bible teaching schedule with planned curriculum',
      'Organize monthly student service opportunities to develop Christlike attitudes',
      'Define and assess spiritual formation outcomes (biblical knowledge, character, values)',
    ],
    kpis: [
      'Spiritual formation plan documented and implemented',
      'Bible taught daily in all classes',
      'Students participate in at least 1 service activity per term',
      'Spiritual outcomes assessed annually with documented results',
    ],
    owners: ['Chaplain', 'Headteacher', 'Class Teachers'],
  },

  CULTURE: {
    title: 'Build a healthy, Christ-centered school culture',
    actions: [
      'Establish regular two-way communication channels with parents (monthly meetings, newsletters)',
      'Develop biblical conflict resolution procedures and train all staff',
      'Create and publish a non-discrimination policy evident in all school activities',
      'Model Christlike love and respect for diversity in all relationships and programs',
    ],
    kpis: [
      'Monthly parent meetings held with documented attendance',
      '100% of staff trained in conflict resolution procedures',
      'Non-discrimination policy published and signed by all staff',
      'Parent/student surveys show positive culture ratings (80%+)',
    ],
    owners: ['Headteacher', 'Parent Liaison', 'Leadership Team'],
  },

  IMPROVEMENT: {
    title: 'Implement continuous school improvement planning',
    actions: [
      'Develop a Continuous School Improvement Plan (CSIP) with at least 4 major goals',
      'Include at least 2 goals focused specifically on teacher professional development',
      'Review and revise the CSIP annually with input from staff, parents, and board',
      'Document evidence of progress toward schoolwide expected student outcomes',
    ],
    kpis: [
      'CSIP completed with 4+ goals, timelines, and responsible parties',
      'At least 2 professional development goals with measurable outcomes',
      'Annual CSIP review meeting held with stakeholder input',
      'Documented evidence shows progress on student outcomes',
    ],
    owners: ['Headteacher', 'Board', 'Leadership Team'],
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
