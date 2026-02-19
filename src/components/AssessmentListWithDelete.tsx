'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AssessmentListWithDelete({ assessments, schoolId, isMentor }: any) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const handleDelete = async (assessmentId: string, assessmentDate: string) => {
    if (!confirm(`Are you sure you want to delete the assessment from ${new Date(assessmentDate).toLocaleDateString()}? This action cannot be undone.`)) {
      return
    }

    setDeleting(assessmentId)

    try {
      const response = await fetch(`/api/assessments/${assessmentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Delete failed')
      }

      router.refresh()
    } catch (error: any) {
      alert(`Failed to delete: ${error.message}`)
      setDeleting(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {assessments.map((assessment: any) => (
        <div
          key={assessment.id}
          style={{
            padding: '1.5rem',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '0.75rem'
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827'
              }}>
                {new Date(assessment.assessment_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                background: assessment.status === 'completed' ? '#dcfce7' : '#fef9c3',
                color: assessment.status === 'completed' ? '#16a34a' : '#ca8a04',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {assessment.status}
              </div>
            </div>

            <div style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              marginBottom: '0.5rem'
            }}>
              Conducted by: {assessment.conductor?.full_name || assessment.conductor?.email || 'Unknown'}
            </div>

            {assessment.overall_score && (
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>Overall Score:</span>
                <span style={{
                  fontWeight: '600',
                  fontSize: '1rem',
                  color: '#3b82f6'
                }}>
                  {assessment.overall_score.toFixed(1)}
                </span>
              </div>
            )}

            {assessment.action_plans && assessment.action_plans.length > 0 && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.875rem',
                color: '#10b981'
              }}>
                ✓ Action plan created
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {assessment.status === 'completed' && (
              <Link
                href={`/schools/${schoolId}/plans/new?assessment=${assessment.id}`}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#3b82f6',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                View Details
              </Link>
            )}

            {isMentor && (
              <button
                onClick={() => handleDelete(assessment.id, assessment.assessment_date)}
                disabled={deleting === assessment.id}
                style={{
                  padding: '0.5rem 1rem',
                  background: deleting === assessment.id ? '#d1d5db' : '#ef4444',
                  color: 'white',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: deleting === assessment.id ? 'not-allowed' : 'pointer',
                  opacity: deleting === assessment.id ? 0.6 : 1
                }}
              >
                {deleting === assessment.id ? 'Deleting...' : '🗑️ Delete'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
