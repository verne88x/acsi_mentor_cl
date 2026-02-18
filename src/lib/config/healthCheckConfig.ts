import { Domain, DomainCode } from '@/types'

/**
 * PSI-BASED Health Check Assessment Configuration
 * Based on ACSI Paths to School Improvement (PSI) Standards Manual
 * 
 * 7 PSI Standards with 5-6 questions each = 40 total questions
 * 
 * Structure:
 * - Each domain corresponds to one PSI Standard
 * - Questions are derived from key PSI indicators
 * - Scoring: 1-5 scale matching PSI rubrics (Not Evident → Very Evident)
 */

export const HEALTH_CHECK_DOMAINS: Domain[] = [
  // STANDARD 1: FOUNDATIONS (6 questions)
  {
    code: 'FOUNDATIONS',
    label: 'Foundations',
    questions: [
      {
        id: 'fnd_faith',
        text: 'The school has a written Statement of Faith that is biblical and Christ-centered.',
      },
      {
        id: 'fnd_philosophy',
        text: 'The school has a documented Philosophy of Christian Education that guides leadership and teachers.',
      },
      {
        id: 'fnd_mission',
        text: 'Clear, written Vision and Mission statements exist that answer: Why does the school exist? Who does it serve? What does it deliver?',
      },
      {
        id: 'fnd_outcomes',
        text: 'The school has identified Schoolwide Expected Student Outcomes (what students should know, believe, and be able to do).',
      },
      {
        id: 'fnd_worldview',
        text: 'Biblical worldview integration is evident in the school\'s foundational documents.',
      },
      {
        id: 'fnd_parent_ack',
        text: 'Parents/guardians have signed acknowledgment recognizing the school\'s unique Christian mission.',
      },
    ],
  },

  // STANDARD 2: LEADERSHIP & PERSONNEL (6 questions)
  {
    code: 'LEADERSHIP',
    label: 'Leadership & Personnel',
    questions: [
      {
        id: 'ld_christ_centered',
        text: 'The school has Christ-centered leadership with clear job descriptions for all staff.',
      },
      {
        id: 'ld_team',
        text: 'A leadership team (minimum 3 people) makes important decisions through prayerful conversation.',
      },
      {
        id: 'ld_faith_statement',
        text: 'All leadership and teachers have signed the school\'s Statement of Faith.',
      },
      {
        id: 'ld_policies',
        text: 'Written policies and procedures exist in an organized, easy-to-reference manual.',
      },
      {
        id: 'ld_development',
        text: 'Annual professional development is provided for administrators and teaching staff.',
      },
      {
        id: 'ld_salaries',
        text: 'The school provides fair salaries and demonstrates biblical stewardship of resources.',
      },
    ],
  },

  // STANDARD 3: TEACHING & LEARNING (7 questions)
  {
    code: 'TEACHING',
    label: 'Teaching & Learning',
    questions: [
      {
        id: 'tch_curriculum',
        text: 'The school has a curriculum plan that meets or exceeds the national curriculum.',
      },
      {
        id: 'tch_worldview',
        text: 'The curriculum plan is based on biblical truth and biblical worldview is integrated into all subjects.',
      },
      {
        id: 'tch_descriptions',
        text: 'Clear course/subject descriptions exist with learning objectives.',
      },
      {
        id: 'tch_assessment',
        text: 'Multiple forms of assessment are used to measure student achievement.',
      },
      {
        id: 'tch_communication',
        text: 'Student progress is regularly communicated to parents/guardians.',
      },
      {
        id: 'tch_ratio',
        text: 'Student-to-teacher ratios allow for effective learning and relationships.',
      },
      {
        id: 'tch_time',
        text: 'Instructional time is protected and appropriate for effective student learning.',
      },
    ],
  },

  // STANDARD 4: FINANCES, FACILITIES, HEALTH & SAFETY (6 questions)
  {
    code: 'FINANCE',
    label: 'Finances, Facilities, Health & Safety',
    questions: [
      {
        id: 'fin_budget',
        text: 'A budget exists accounting for fair salaries, instructional materials, and infrastructure maintenance.',
      },
      {
        id: 'fin_records',
        text: 'Student records are organized, current, protected, and include medical information.',
      },
      {
        id: 'fin_space',
        text: 'Classroom space is adequate for the number of students enrolled.',
      },
      {
        id: 'fin_safety',
        text: 'A written health and safety plan exists covering: illness/injury, abuse prevention, and campus security.',
      },
      {
        id: 'fin_wash_basic',
        text: 'The school provides: handwashing stations, separate gender toilets, clean drinking water, and seating for all students.',
      },
      {
        id: 'fin_wash_standard',
        text: 'The school has achieved at least the UNICEF WASH Two-Star standard for hygiene and sanitation.',
      },
    ],
  },

  // STANDARD 5: SPIRITUAL FORMATION (6 questions)
  {
    code: 'SPIRITUAL',
    label: 'Spiritual Formation',
    questions: [
      {
        id: 'sp_plan',
        text: 'The school has a written plan for spiritual nurture and discipleship of students.',
      },
      {
        id: 'sp_bible',
        text: 'Bible is taught regularly in a planned, purposeful way across all grade levels.',
      },
      {
        id: 'sp_service',
        text: 'Students are given opportunities to serve others and develop Christlike attitudes.',
      },
      {
        id: 'sp_outcomes',
        text: 'Schoolwide Expected Student Outcomes include spiritual formation goals (biblical knowledge, character, values).',
      },
      {
        id: 'sp_assessment',
        text: 'Spiritual formation outcomes are assessed annually.',
      },
      {
        id: 'sp_staff_model',
        text: 'Staff-student interactions consistently reflect the attitude of Christ.',
      },
    ],
  },

  // STANDARD 6: SCHOOL CULTURE (5 questions)
  {
    code: 'CULTURE',
    label: 'School Culture',
    questions: [
      {
        id: 'cul_unity',
        text: 'The school culture displays unity, good attitudes, and support from staff, families, and community.',
      },
      {
        id: 'cul_communication',
        text: 'Regular, effective two-way communication occurs between school and parents/community.',
      },
      {
        id: 'cul_conflict',
        text: 'The school has established biblical principles for resolving conflicts (staff, parents, community).',
      },
      {
        id: 'cul_non_discrimination',
        text: 'The school has a non-discrimination policy that is evident in all actions, relationships, and programs.',
      },
      {
        id: 'cul_diversity',
        text: 'Christlike love and respect for diversity (ethnicity, gender) is modeled throughout the school.',
      },
    ],
  },

  // STANDARD 7: SCHOOL IMPROVEMENT & DEVELOPMENT PLAN (4 questions)
  {
    code: 'IMPROVEMENT',
    label: 'School Improvement & Development',
    questions: [
      {
        id: 'imp_csip',
        text: 'A written Continuous School Improvement Plan (CSIP) exists with at least 4 major goals.',
      },
      {
        id: 'imp_prof_dev',
        text: 'The CSIP includes at least 2 goals focused on teacher professional development.',
      },
      {
        id: 'imp_review',
        text: 'The CSIP is reviewed and revised annually with input from school community stakeholders.',
      },
      {
        id: 'imp_evidence',
        text: 'The CSIP reflects progress toward schoolwide expected student outcomes with documented evidence.',
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
 * PSI-Based Scoring Guide (aligned with PSI rubrics)
 * 1 = Not Evident
 * 2 = Partially Evident  
 * 3 = Evident
 * 4 = Very Evident
 * 5 = Exemplary (exceeds Very Evident)
 */
export const SCORING_GUIDE = {
  1: {
    label: 'Not Evident',
    description: 'Practice/policy does not exist or is not implemented',
    color: '#dc2626', // red-600
  },
  2: {
    label: 'Partially Evident',
    description: 'Practice exists but is incomplete or inconsistently applied',
    color: '#ea580c', // orange-600
  },
  3: {
    label: 'Evident',
    description: 'Practice is established and consistently followed',
    color: '#eab308', // yellow-500
  },
  4: {
    label: 'Very Evident',
    description: 'Practice is well-established with strong evidence of impact',
    color: '#22c55e', // green-500
  },
  5: {
    label: 'Exemplary',
    description: 'Practice is exemplary and recognized as a model for others',
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

/**
 * Total question count for validation
 */
export const TOTAL_QUESTIONS = HEALTH_CHECK_DOMAINS.reduce(
  (sum, domain) => sum + domain.questions.length,
  0
) // Should be 40
