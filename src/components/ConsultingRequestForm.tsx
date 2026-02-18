'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { School, Timeline } from '@/types'

interface ConsultingRequestFormProps {
  school: School
  userId: string
}

const SCHOOL_TYPE_OPTIONS = [
  { value: 'pre-primary', label: 'Pre-Primary (PP1–PP2)' },
  { value: 'primary', label: 'Primary School (Grade 1–6)' },
  { value: 'junior-secondary', label: 'Junior Secondary School (Grade 7–9)' },
  { value: 'senior-secondary', label: 'Senior Secondary School (Grade 10–12)' },
  { value: 'other', label: 'Other' },
]

export default function ConsultingRequestForm({ school, userId }: ConsultingRequestFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    contact_person: '',
    contact_role: '',
    contact_email: '',
    contact_phone: '',
    year_established: '',
    total_students: school.student_count?.toString() || '',
    number_teachers: school.staff_count?.toString() || '',
    affiliation: '',
    school_types: [] as string[], // Multiple selection
    school_type_other: '',
    current_status: '',
    strategic_planning: 0,
    organizational_dev: 0,
    teacher_training: 0,
    fundraising: 0,
    values_integration: 0,
    communication_marketing: 0,
    other_need: '',
    other_rating: 0,
    key_challenges: '',
    desired_outcomes: '',
    timeline: '' as Timeline | '',
    additional_comments: '',
  })

  const handleSchoolTypeToggle = (value: string) => {
    setFormData(prev => ({
      ...prev,
      school_types: prev.school_types.includes(value)
        ? prev.school_types.filter(t => t !== value)
        : [...prev.school_types, value]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const session = await supabase.auth.getSession()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/rest/v1/consulting_requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${session?.data.session?.access_token}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          school_id: school.id,
          created_by: userId,
          contact_person: formData.contact_person || null,
          contact_role: formData.contact_role || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          year_established: formData.year_established ? parseInt(formData.year_established) : null,
          total_students: formData.total_students ? parseInt(formData.total_students) : null,
          number_teachers: formData.number_teachers ? parseInt(formData.number_teachers) : null,
          affiliation: formData.affiliation || null,
          school_types: formData.school_types.length > 0 ? formData.school_types : null,
          school_type_other: formData.school_type_other || null,
          current_status: formData.current_status || null,
          strategic_planning: formData.strategic_planning || null,
          organizational_dev: formData.organizational_dev || null,
          teacher_training: formData.teacher_training || null,
          fundraising: formData.fundraising || null,
          values_integration: formData.values_integration || null,
          communication_marketing: formData.communication_marketing || null,
          other_need: formData.other_need || null,
          other_rating: formData.other_rating || null,
          key_challenges: formData.key_challenges || null,
          desired_outcomes: formData.desired_outcomes || null,
          timeline: formData.timeline || null,
          additional_comments: formData.additional_comments || null,
          status: 'pending'
        })
      })

      if (!response.ok) throw new Error('Failed to submit')

      alert('Consultation form submitted successfully!')
      router.push(`/schools/${school.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Failed to submit consultation form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const RatingSelector = ({ value, onChange, name }: { value: number; onChange: (v: number) => void; name: string }) => (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <label key={rating} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
          <input type="radio" name={name} value={rating} checked={value === rating} onChange={() => onChange(rating)} style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#3b82f6' }} />
          <span style={{ fontSize: '0.8125rem', color: '#6b7280' }}>{rating}</span>
        </label>
      ))}
    </div>
  )

  const inputStyle = { width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9375rem' }
  const labelStyle = { display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151', fontSize: '0.9375rem' }
  const sectionTitleStyle = { fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginTop: '2rem', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e5e7eb' }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        <div style={sectionTitleStyle}>1. School Information</div>
        <div>
          <label style={labelStyle}>School Name</label>
          <input type="text" value={school.name} disabled style={{ ...inputStyle, background: '#f3f4f6', cursor: 'not-allowed' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Contact Person</label><input type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} style={inputStyle} placeholder="Full name" /></div>
          <div><label style={labelStyle}>Role/Title</label><input type="text" value={formData.contact_role} onChange={(e) => setFormData({ ...formData, contact_role: e.target.value })} style={inputStyle} placeholder="e.g., Headteacher" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Email</label><input type="email" value={formData.contact_email} onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })} style={inputStyle} placeholder="email@example.com" /></div>
          <div><label style={labelStyle}>Phone</label><input type="tel" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} style={inputStyle} placeholder="+254 712 345678" /></div>
        </div>

        <div style={sectionTitleStyle}>2. School Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div><label style={labelStyle}>Year Established</label><input type="number" min="1900" max={new Date().getFullYear()} value={formData.year_established} onChange={(e) => setFormData({ ...formData, year_established: e.target.value })} style={inputStyle} placeholder="2010" /></div>
          <div><label style={labelStyle}>Total Students</label><input type="number" min="0" value={formData.total_students} onChange={(e) => setFormData({ ...formData, total_students: e.target.value })} style={inputStyle} placeholder="250" /></div>
          <div><label style={labelStyle}>Number of Teachers</label><input type="number" min="0" value={formData.number_teachers} onChange={(e) => setFormData({ ...formData, number_teachers: e.target.value })} style={inputStyle} placeholder="15" /></div>
        </div>
        <div>
          <label style={labelStyle}>Affiliation (Denomination / Association)</label>
          <input type="text" value={formData.affiliation} onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })} style={inputStyle} placeholder="e.g., Anglican, Independent" />
        </div>

        <div>
          <label style={labelStyle}>School Type (select all that apply)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {SCHOOL_TYPE_OPTIONS.map((option) => (
              <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.school_types.includes(option.value)}
                  onChange={() => handleSchoolTypeToggle(option.value)}
                  style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#3b82f6' }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          {formData.school_types.includes('other') && (
            <input type="text" value={formData.school_type_other} onChange={(e) => setFormData({ ...formData, school_type_other: e.target.value })} style={{ ...inputStyle, marginTop: '0.75rem' }} placeholder="Please specify" />
          )}
        </div>

        <div style={sectionTitleStyle}>3. Current Situation</div>
        <div><label style={labelStyle}>Briefly describe the school's current status and main priorities</label><textarea rows={4} value={formData.current_status} onChange={(e) => setFormData({ ...formData, current_status: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What is happening at your school right now?" /></div>

        <div style={sectionTitleStyle}>4. Consulting Needs Assessment</div>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Rate your current level of need in each area (1 = low, 5 = high)</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Strategic Planning</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>Setting vision, goals, and development roadmap</div><RatingSelector value={formData.strategic_planning} onChange={(v) => setFormData({ ...formData, strategic_planning: v })} name="strategic_planning" /></div>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Organizational Development</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>Leadership structure, governance, team roles</div><RatingSelector value={formData.organizational_dev} onChange={(v) => setFormData({ ...formData, organizational_dev: v })} name="organizational_dev" /></div>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Teacher & Staff Training</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>Professional growth, Christian pedagogy</div><RatingSelector value={formData.teacher_training} onChange={(v) => setFormData({ ...formData, teacher_training: v })} name="teacher_training" /></div>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Fundraising & Partnerships</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>Grants, donor relations, sustainability</div><RatingSelector value={formData.fundraising} onChange={(v) => setFormData({ ...formData, fundraising: v })} name="fundraising" /></div>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Values Integration</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>Biblical worldview, Christian character in teaching</div><RatingSelector value={formData.values_integration} onChange={(v) => setFormData({ ...formData, values_integration: v })} name="values_integration" /></div>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Communication & Marketing</div><div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>School visibility, parent relations</div><RatingSelector value={formData.communication_marketing} onChange={(v) => setFormData({ ...formData, communication_marketing: v })} name="communication_marketing" /></div>
          <div><div style={{ fontWeight: '500', marginBottom: '0.5rem' }}>Other (please specify)</div><input type="text" value={formData.other_need} onChange={(e) => setFormData({ ...formData, other_need: e.target.value })} style={{ ...inputStyle, marginBottom: '0.75rem' }} placeholder="Describe any other area" />{formData.other_need && <RatingSelector value={formData.other_rating} onChange={(v) => setFormData({ ...formData, other_rating: v })} name="other_rating" />}</div>
        </div>

        <div style={sectionTitleStyle}>5. Key Challenges</div>
        <div><label style={labelStyle}>What are your school's biggest challenges right now?</label><textarea rows={4} value={formData.key_challenges} onChange={(e) => setFormData({ ...formData, key_challenges: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="List the main obstacles or difficulties" /></div>

        <div style={sectionTitleStyle}>6. Desired Outcomes</div>
        <div><label style={labelStyle}>What would success look like after working with ACSI consultants?</label><textarea rows={4} value={formData.desired_outcomes} onChange={(e) => setFormData({ ...formData, desired_outcomes: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Describe what you hope to achieve" /></div>

        <div style={sectionTitleStyle}>7. Timeline & Availability</div>
        <div>
          <label style={labelStyle}>When would you like to start consulting?</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            {(['1-3 months', '3-6 months', 'next year'] as const).map((option) => (
              <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name="timeline" value={option} checked={formData.timeline === option} onChange={(e) => setFormData({ ...formData, timeline: e.target.value as Timeline })} style={{ cursor: 'pointer' }} />
                <span>{option === '1-3 months' ? 'Next 1–3 months' : option === '3-6 months' ? '3–6 months' : 'Next school year'}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={sectionTitleStyle}>8. Additional Comments</div>
        <div><textarea rows={3} value={formData.additional_comments} onChange={(e) => setFormData({ ...formData, additional_comments: e.target.value })} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Any other information you'd like to share" /></div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #e5e7eb' }}>
          <button type="submit" disabled={submitting} style={{ flex: 1, padding: '1rem 2rem', background: submitting ? '#9ca3af' : '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
          <button type="button" onClick={() => router.push(`/schools/${school.id}`)} style={{ padding: '1rem 2rem', background: 'white', color: '#6b7280', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1rem', fontWeight: '600', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
