import { Domain, DomainCode } from '@/types'

/**
 * Health Check Assessment Configuration
 * 
 * This configuration can be easily modified to add/remove/change:
 * - Domains (categories)
 * - Questions within each domain
 * - Question text
 * 
 * Structure:
 * - Each domain has a code (used as key in responses)
 * - Each domain has a label (displayed to users)
 * - Each domain has questions with unique IDs and text
 */

export const HEALTH_CHECK_DOMAINS: Domain[] = [
  {
    code: 'LEADERSHIP',
    label: 'Leadership & Management',
    questions: [
      {
        id: 'ld_vision',
        text: 'The school has a clear vision and priorities that guide decisions.',
      },
      {
        id: 'ld_accountability',
        text: 'Leaders follow through on commitments and hold people accountable.',
      },
      {
        id: 'ld_development',
        text: 'Staff receive coaching, feedback, and professional development opportunities.',
      },
    ],
  },
  {
    code: 'TEACHING',
    label: 'Teaching & Learning',
    questions: [
      {
        id: 'tch_planning',
        text: 'Teachers plan lessons and use curriculum materials effectively.',
      },
      {
        id: 'tch_assessment',
        text: 'Student work is assessed regularly and feedback is given.',
      },
      {
        id: 'tch_differentiation',
        text: 'Teaching meets diverse learner needs (remedial, gifted, special needs).',
      },
    ],
  },
  {
    code: 'GOVERNANCE',
    label: 'Governance & Policies',
    questions: [
      {
        id: 'gov_policies',
        text: 'Key policies exist (HR, finance, safeguarding) and are followed.',
      },
      {
        id: 'gov_oversight',
        text: 'The Board provides effective oversight and strategic direction.',
      },
      {
        id: 'gov_roles',
        text: 'Decision-making roles are clear (Board vs. management).',
      },
    ],
  },
  {
    code: 'CHILD_PROTECTION',
    label: 'Child Protection & Safeguarding',
    questions: [
      {
        id: 'cp_policy',
        text: 'Child protection policy exists and is known by staff.',
      },
      {
        id: 'cp_reporting',
        text: 'Reporting procedures are clear and used when concerns arise.',
      },
      {
        id: 'cp_environment',
        text: 'The environment is safe (supervision, boundaries, physical safety).',
      },
      {
        id: 'cp_training',
        text: 'Staff receive safeguarding training and understand their responsibilities.',
      },
    ],
  },
  {
    code: 'FINANCE',
    label: 'Financial Stewardship',
    questions: [
      {
        id: 'fin_budget',
        text: 'A budget exists and is followed; spending is tracked against it.',
      },
      {
        id: 'fin_records',
        text: 'Records are accurate (fees, receipts, expenses) and reconciled regularly.',
      },
      {
        id: 'fin_fees',
        text: 'Fee collection and arrears processes are consistent and fair.',
      },
    ],
  },
  {
    code: 'SPIRITUAL',
    label: 'Spiritual Formation',
    questions: [
      {
        id: 'sp_culture',
        text: 'Christian values are visible in the school culture and relationships.',
      },
      {
        id: 'sp_devotions',
        text: 'Devotions/Bible teaching is planned and happens consistently.',
      },
      {
        id: 'sp_staff',
        text: 'Staff model character and spiritual maturity in their work.',
      },
    ],
  },
]

/**
 * Get domain by code
 */
export function getDomain(code: DomainCode): Domain | undefined {
  return HEALTH_CHECK_DOMAINS.find(d => d.code === code)
}

/**
 * Get all domain codes
 */
export function getDomainCodes(): DomainCode[] {
  return HEALTH_CHECK_DOMAINS.map(d => d.code)
}

/**
 * Scoring guide for reference
 */
export const SCORING_GUIDE = {
  1: {
    label: 'Critical Need',
    description: 'Major gaps; immediate intervention required',
    color: '#dc2626', // red-600
  },
  2: {
    label: 'Significant Gaps',
    description: 'Many areas need improvement',
    color: '#ea580c', // orange-600
  },
  3: {
    label: 'Developing',
    description: 'Basic practices in place, but inconsistent',
    color: '#eab308', // yellow-500
  },
  4: {
    label: 'Good',
    description: 'Solid practices, minor improvements needed',
    color: '#22c55e', // green-500
  },
  5: {
    label: 'Excellent',
    description: 'Exemplary practices, sustainable systems',
    color: '#16a34a', // green-600
  },
}

/**
 * Calculate overall assessment score from domain responses
 */
export function calculateOverallScore(responses: Record<string, any>): number {
  const scores = Object.values(responses)
    .map((r: any) => r.score)
    .filter((s): s is number => typeof s === 'number')
  
  if (scores.length === 0) return 0
  
  const sum = scores.reduce((acc, score) => acc + score, 0)
  return Math.round((sum / scores.length) * 100) / 100
}

/**
 * Get color for a score
 */
export function getScoreColor(score: number): string {
  const rounded = Math.round(score)
  return SCORING_GUIDE[rounded as keyof typeof SCORING_GUIDE]?.color || '#6b7280'
}

/**
 * Get label for a score
 */
export function getScoreLabel(score: number): string {
  const rounded = Math.round(score)
  return SCORING_GUIDE[rounded as keyof typeof SCORING_GUIDE]?.label || 'Not rated'
}
