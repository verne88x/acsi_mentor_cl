// Database Types
export type Role = 'mentor' | 'school_admin' | 'acsi_admin';

export type AssessmentStatus = 'draft' | 'completed';
export type ActionPlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type ActionItemStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type NoteType = 'visit' | 'phone_call' | 'observation' | 'other';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: Role;
  created_at: string;
  updated_at: string;
}

export interface School {
  id: string;
  name: string;
  county: string | null;
  town: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  head_teacher: string | null;
  student_count: number | null;
  staff_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface SchoolMember {
  id: string;
  school_id: string;
  user_id: string;
  role: 'mentor' | 'school_admin';
  created_at: string;
}

export interface Assessment {
  id: string;
  school_id: string;
  conducted_by: string;
  assessment_date: string;
  status: AssessmentStatus;
  responses: AssessmentResponses;
  overall_score: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActionPlan {
  id: string;
  school_id: string;
  assessment_id: string | null;
  created_by: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ActionPlanStatus;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: string;
  plan_id: string;
  domain: string;
  description: string;
  owner_name: string | null;
  kpi: string | null;
  priority: 1 | 2 | 3 | null;
  status: ActionItemStatus;
  due_date: string | null;
  completed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MentorNote {
  id: string;
  school_id: string;
  mentor_id: string;
  visit_date: string | null;
  note_type: NoteType | null;
  content: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Health Check Assessment Types (PSI-based)
export type DomainCode = 
  | 'FOUNDATIONS'          // PSI Standard 1
  | 'LEADERSHIP'           // PSI Standard 2
  | 'TEACHING'             // PSI Standard 3
  | 'FINANCE'              // PSI Standard 4
  | 'SPIRITUAL'            // PSI Standard 5
  | 'CULTURE'              // PSI Standard 6
  | 'IMPROVEMENT';         // PSI Standard 7

export interface Question {
  id: string;
  text: string;
}

export interface Domain {
  code: DomainCode;
  label: string;
  questions: Question[];
}

export interface QuestionResponse {
  score: number; // 1-5
  notes?: string;
}

export interface DomainResponse {
  score: number; // Average of question scores
  notes?: string;
  questions: Record<string, QuestionResponse>;
}

export interface AssessmentResponses {
  [domainCode: string]: DomainResponse;
}

// Action Plan Template Types
export interface PlanTemplate {
  title: string;
  actions: string[];
  kpis: string[];
  owners: string[];
}

export interface PlanTemplates {
  [domainCode: string]: PlanTemplate;
}

// UI Types
export interface SchoolWithMembers extends School {
  school_members: SchoolMember[];
}

export interface AssessmentWithDetails extends Assessment {
  school: School;
  conductor: Profile;
}

export interface ActionPlanWithItems extends ActionPlan {
  action_items: ActionItem[];
}
