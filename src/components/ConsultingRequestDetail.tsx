'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ConsultingRequestWithDetails } from '@/types'
import { generateConsultingRequestPDF } from '@/lib/pdf/consultingRequestPdfGenerator'

interface ConsultingRequestDetailProps {
  request: ConsultingRequestWithDetails
}

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  'pre-primary': 'Pre-Primary (PP1–PP2)',
  'primary': 'Primary School (Grade 1–6)',
  'junior-secondary': 'Junior Secondary School (Grade 7–9)',
  'senior-secondary': 'Senior Secondary School (Grade 10–12)',
  'other': 'Other',
}

export default function ConsultingRequestDetail({ request }: ConsultingRequestDetailProps) {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState(request.status)
  const [mentorNotes, setMentorNotes] = useState(request.mentor_notes || '')
  const [updating, setUpdating] = useState(false)
  const [exporting, setExporting] = useState(false)

  const handleStatusUpdate = async () => {
    setUpdating(true)
    try {
      const session = await supabase.auth.getSession()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/rest/v1/consulting_requests?id=eq.${request.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${session?.data.session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status,
          mentor_notes: mentorNotes || null
        })
      })

      if (!response.ok) throw new Error('Failed to update')

      alert('Status updated successfully!')
      router.refresh()
    } catch (error) {
      console.error('Error updating:', error)
      alert('Failed to update. Please try again.')
    } finally {
      setUpdating(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await generateConsultingRequestPDF(request)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'pending': return '#eab308'
      case 'reviewed': return '#3b82f6'
      case 'contacted': return '#8b5cf6'
      case 'completed': return '#22c55e'
      default: return '#6b7280'
    }
  }

  const sectionStyle = {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb'
  }

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '0.25rem'
  }

  const valueStyle = {
    fontSize: '1rem',
    color: '#111827'
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '2.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1rem'
        }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              margin: '0 0 0.5rem 0'
            }}>
              {request.school.name}
            </h1>
            <p style={{
              color: '#6b7280',
              margin: '0 0 0.5rem 0'
            }}>
              {request.school.town}, {request.school.county}
            </p>
            <p style={{
              fontSize: '0.875rem',
              color: '#9ca3af',
              margin: 0
            }}>
              Submitted: {new Date(request.created_at).toLocaleDateString()} by {request.creator?.full_name || request.creator?.email}
            </p>
          </div>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600',
            background: `${getStatusColor(status)}20`,
            color: getStatusColor(status)
          }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            style={{
              padding: '0.75rem 1.5rem',
              background: exporting ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: exporting ? 'not-allowed' : 'pointer',
            }}
          >
            {exporting ? 'Generating PDF...' : 'Export as PDF'}
          </button>
        </div>
      </div>

      {/* 1. Contact Information */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Contact Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {request.contact_person && (
            <div>
              <div style={labelStyle}>Contact Person</div>
              <div style={valueStyle}>{request.contact_person}</div>
            </div>
          )}
          {request.contact_role && (
            <div>
              <div style={labelStyle}>Role/Title</div>
              <div style={valueStyle}>{request.contact_role}</div>
            </div>
          )}
          {request.contact_email && (
            <div>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{request.contact_email}</div>
            </div>
          )}
          {request.contact_phone && (
            <div>
              <div style={labelStyle}>Phone</div>
              <div style={valueStyle}>{request.contact_phone}</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. School Profile */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>School Profile</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {request.year_established && (
            <div>
              <div style={labelStyle}>Year Established</div>
              <div style={valueStyle}>{request.year_established}</div>
            </div>
          )}
          {request.total_students && (
            <div>
              <div style={labelStyle}>Total Students</div>
              <div style={valueStyle}>{request.total_students}</div>
            </div>
          )}
          {request.number_teachers && (
            <div>
              <div style={labelStyle}>Number of Teachers</div>
              <div style={valueStyle}>{request.number_teachers}</div>
            </div>
          )}
        </div>
        {request.affiliation && (
          <div style={{ marginTop: '1rem' }}>
            <div style={labelStyle}>Affiliation</div>
            <div style={valueStyle}>{request.affiliation}</div>
          </div>
        )}
        {request.school_types && request.school_types.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <div style={labelStyle}>School Type</div>
            <div style={valueStyle}>
              {request.school_types.map(t => SCHOOL_TYPE_LABELS[t] || t).join(', ')}
              {request.school_type_other && ` (${request.school_type_other})`}
            </div>
          </div>
        )}
      </div>

      {/* 3. Current Situation */}
      {request.current_status && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Current Situation</h2>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{request.current_status}</div>
        </div>
      )}

      {/* 4. Consulting Needs */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Consulting Needs (1-5)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {request.strategic_planning && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>Strategic Planning</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.strategic_planning}/5</span>
            </div>
          )}
          {request.organizational_dev && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>Organizational Development</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.organizational_dev}/5</span>
            </div>
          )}
          {request.teacher_training && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>Teacher & Staff Training</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.teacher_training}/5</span>
            </div>
          )}
          {request.fundraising && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>Fundraising & Partnerships</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.fundraising}/5</span>
            </div>
          )}
          {request.values_integration && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>Values Integration</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.values_integration}/5</span>
            </div>
          )}
          {request.communication_marketing && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>Communication & Marketing</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.communication_marketing}/5</span>
            </div>
          )}
          {request.other_need && request.other_rating && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f9fafb', borderRadius: '6px' }}>
              <span>{request.other_need}</span>
              <span style={{ fontWeight: '600', color: '#3b82f6' }}>{request.other_rating}/5</span>
            </div>
          )}
        </div>
      </div>

      {/* 5. Key Challenges */}
      {request.key_challenges && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Key Challenges</h2>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{request.key_challenges}</div>
        </div>
      )}

      {/* 6. Desired Outcomes */}
      {request.desired_outcomes && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Desired Outcomes</h2>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{request.desired_outcomes}</div>
        </div>
      )}

      {/* 7. Timeline */}
      {request.timeline && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Timeline</h2>
          <div style={valueStyle}>{request.timeline}</div>
        </div>
      )}

      {/* 8. Additional Comments */}
      {request.additional_comments && (
        <div style={sectionStyle}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Additional Comments</h2>
          <div style={{ ...valueStyle, whiteSpace: 'pre-wrap' }}>{request.additional_comments}</div>
        </div>
      )}

      {/* Mentor Actions */}
      <div style={{ marginTop: '2rem', padding: '2rem', background: '#f9fafb', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Mentor Actions</h2>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mentor Notes</label>
          <textarea
            value={mentorNotes}
            onChange={(e) => setMentorNotes(e.target.value)}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            placeholder="Add notes about follow-up, next steps, etc."
          />
        </div>

        <button
          onClick={handleStatusUpdate}
          disabled={updating}
          style={{
            padding: '0.75rem 1.5rem',
            background: updating ? '#9ca3af' : '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: updating ? 'not-allowed' : 'pointer',
          }}
        >
          {updating ? 'Updating...' : 'Update Status & Notes'}
        </button>
      </div>
    </div>
  )
}
