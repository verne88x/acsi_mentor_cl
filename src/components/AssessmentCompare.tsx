'use client'

import { useState } from 'react'
import { HEALTH_CHECK_DOMAINS, getScoreColor } from '@/lib/config/healthCheckConfig'

interface AssessmentCompareProps {
  assessments: any[]
  schoolId: string
}

export default function AssessmentCompare({ assessments, schoolId }: AssessmentCompareProps) {
  const [selected, setSelected] = useState<string[]>(
    assessments.slice(0, 3).map((a: any) => a.id)
  )

  const toggleAssessment = (id: string) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(s => s !== id)
        : prev.length < 4 ? [...prev, id] : prev
    )
  }

  const selectedAssessments = assessments.filter((a: any) => selected.includes(a.id))

  const getName = (a: any) => a.respondent_name
    ? `${a.respondent_name}\n${a.respondent_role}`
    : a.conductor?.full_name || a.conductor?.email || 'Unknown'

  const getScore = (a: any, domainCode: string) =>
    a.responses?.[domainCode]?.score || 0

  return (
    <div>
      {/* Assessment selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
          Select up to 4 assessments to compare:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {assessments.map((a: any) => {
            const isSelected = selected.includes(a.id)
            const name = a.respondent_name || a.conductor?.full_name || 'Unknown'
            const date = new Date(a.assessment_date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })
            return (
              <button
                key={a.id}
                onClick={() => toggleAssessment(a.id)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  border: `2px solid ${isSelected ? '#3b82f6' : '#e5e7eb'}`,
                  background: isSelected ? '#eff6ff' : 'white',
                  color: isSelected ? '#3b82f6' : '#6b7280',
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {name} · {date}
                {a.overall_score && ` · ${a.overall_score.toFixed(1)}`}
              </button>
            )
          })}
        </div>
      </div>

      {selectedAssessments.length < 2 ? (
        <div style={{
          padding: '2rem', textAlign: 'center',
          color: '#6b7280', background: '#f9fafb', borderRadius: '8px'
        }}>
          Select at least 2 assessments to compare.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{
                  padding: '0.75rem 1rem', textAlign: 'left',
                  fontSize: '0.75rem', color: '#6b7280', fontWeight: '600',
                  background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                  minWidth: '160px'
                }}>
                  Domain
                </th>
                {selectedAssessments.map((a: any) => (
                  <th key={a.id} style={{
                    padding: '0.75rem 1rem', textAlign: 'center',
                    fontSize: '0.75rem', color: '#374151', fontWeight: '600',
                    background: '#f9fafb', borderBottom: '1px solid #e5e7eb',
                    minWidth: '140px'
                  }}>
                    <div>{a.respondent_name || a.conductor?.full_name || 'Unknown'}</div>
                    {a.respondent_role && (
                      <div style={{ color: '#6b7280', fontWeight: '400' }}>{a.respondent_role}</div>
                    )}
                    <div style={{ color: '#9ca3af', fontWeight: '400' }}>
                      {new Date(a.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HEALTH_CHECK_DOMAINS.map((domain, idx) => {
                const scores = selectedAssessments.map(a => getScore(a, domain.code))
                const max = Math.max(...scores)
                const min = Math.min(...scores)
                const hasGap = max - min >= 1

                return (
                  <tr key={domain.code} style={{
                    background: idx % 2 === 0 ? 'white' : '#f9fafb'
                  }}>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      borderBottom: '1px solid #f3f4f6'
                    }}>
                      {domain.label}
                      {hasGap && (
                        <span style={{
                          marginLeft: '0.5rem', fontSize: '0.7rem',
                          color: '#f59e0b', fontWeight: '600'
                        }}>
                          ⚠ Gap {(max - min).toFixed(1)}
                        </span>
                      )}
                    </td>
                    {selectedAssessments.map((a: any) => {
                      const score = getScore(a, domain.code)
                      const color = getScoreColor(score)
                      const isHighest = score === max && selectedAssessments.length > 1
                      const isLowest = score === min && selectedAssessments.length > 1 && min !== max

                      return (
                        <td key={a.id} style={{
                          padding: '0.75rem 1rem',
                          textAlign: 'center',
                          borderBottom: '1px solid #f3f4f6'
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '48px', height: '48px',
                            borderRadius: '50%',
                            background: `${color}20`,
                            border: `2px solid ${color}`,
                            fontWeight: '700',
                            fontSize: '0.875rem',
                            color,
                          }}>
                            {score > 0 ? score.toFixed(1) : '–'}
                          </div>
                          {isHighest && score > 0 && (
                            <div style={{ fontSize: '0.65rem', color: '#10b981', marginTop: '2px' }}>▲ highest</div>
                          )}
                          {isLowest && score > 0 && (
                            <div style={{ fontSize: '0.65rem', color: '#ef4444', marginTop: '2px' }}>▼ lowest</div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}

              {/* Overall Score Row */}
              <tr style={{ background: '#f0f9ff', fontWeight: '700' }}>
                <td style={{
                  padding: '0.75rem 1rem', fontSize: '0.875rem',
                  color: '#1e40af', borderTop: '2px solid #bfdbfe'
                }}>
                  Overall Score
                </td>
                {selectedAssessments.map((a: any) => (
                  <td key={a.id} style={{
                    padding: '0.75rem 1rem', textAlign: 'center',
                    fontSize: '1.125rem', color: '#1e40af',
                    borderTop: '2px solid #bfdbfe'
                  }}>
                    {a.overall_score?.toFixed(1) || '–'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
