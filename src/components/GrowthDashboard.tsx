'use client'

import { Assessment, School } from '@/types'
import { HEALTH_CHECK_DOMAINS } from '@/lib/config/healthCheckConfig'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GrowthDashboardProps {
  school: School
  assessments: Assessment[]
}

export default function GrowthDashboard({ school, assessments }: GrowthDashboardProps) {
  
  // Calculate domain scores for each assessment
  const assessmentData = assessments.map(assessment => {
    const date = new Date(assessment.assessment_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
    
    const domainScores: any = { date, overall: assessment.overall_score || 0 }
    
    HEALTH_CHECK_DOMAINS.forEach(domain => {
      const response = assessment.responses[domain.code]
      domainScores[domain.code] = response?.score || 0
    })
    
    return domainScores
  })

  // Calculate improvement metrics
  const latestAssessment = assessments[assessments.length - 1]
  const previousAssessment = assessments[assessments.length - 2]
  
  const latestOverall = latestAssessment.overall_score || 0
  const previousOverall = previousAssessment.overall_score || 0
  const overallImprovement = latestOverall - previousOverall
  const overallImprovementPercent = previousOverall > 0 
    ? ((overallImprovement / previousOverall) * 100).toFixed(1)
    : '0'

  // Calculate per-domain improvements
  const domainImprovements = HEALTH_CHECK_DOMAINS.map(domain => {
    const latestScore = latestAssessment.responses[domain.code]?.score || 0
    const previousScore = previousAssessment.responses[domain.code]?.score || 0
    const improvement = latestScore - previousScore
    
    return {
      domain,
      latestScore,
      previousScore,
      improvement,
      improvementPercent: previousScore > 0 
        ? ((improvement / previousScore) * 100).toFixed(1)
        : '0'
    }
  }).sort((a, b) => b.improvement - a.improvement)

  const bestImprovement = domainImprovements[0]
  const worstImprovement = domainImprovements[domainImprovements.length - 1]

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1rem' 
      }}>
        <div style={{
          padding: '1.5rem',
          background: overallImprovement >= 0 ? '#dcfce7' : '#fee2e2',
          borderRadius: '8px',
          border: `2px solid ${overallImprovement >= 0 ? '#22c55e' : '#ef4444'}`
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Overall Score Change
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: overallImprovement >= 0 ? '#22c55e' : '#ef4444',
            marginBottom: '0.25rem'
          }}>
            {overallImprovement >= 0 ? '+' : ''}{overallImprovement.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            {overallImprovementPercent}% {overallImprovement >= 0 ? 'improvement' : 'decline'}
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#dbeafe',
          borderRadius: '8px',
          border: '2px solid #3b82f6'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Current Score
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#3b82f6',
            marginBottom: '0.25rem'
          }}>
            {latestOverall.toFixed(1)}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            Previous: {previousOverall.toFixed(1)}
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#dcfce7',
          borderRadius: '8px',
          border: '2px solid #22c55e'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Best Improvement
          </div>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {bestImprovement.domain.label}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#22c55e' }}>
            +{bestImprovement.improvement.toFixed(2)} ({bestImprovement.improvementPercent}%)
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#fee2e2',
          borderRadius: '8px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Needs Attention
          </div>
          <div style={{ 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {worstImprovement.domain.label}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#ef4444' }}>
            {worstImprovement.improvement >= 0 ? '+' : ''}{worstImprovement.improvement.toFixed(2)} ({worstImprovement.improvementPercent}%)
          </div>
        </div>
      </div>

      {/* Overall Score Trend */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Overall Score Trend
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={assessmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="overall" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Overall Score"
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-Standard Trends */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Standards Performance Over Time
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={assessmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            {HEALTH_CHECK_DOMAINS.map((domain, index) => (
              <Line
                key={domain.code}
                type="monotone"
                dataKey={domain.code}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={domain.label}
                dot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Improvements Table */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Detailed Standard Changes
        </h2>
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          overflow: 'hidden' 
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'left', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Standard
                </th>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Previous
                </th>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Latest
                </th>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Change
                </th>
                <th style={{ 
                  padding: '0.75rem 1rem', 
                  textAlign: 'center', 
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#6b7280'
                }}>
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {domainImprovements.map((item, index) => (
                <tr key={item.domain.code} style={{ 
                  borderTop: '1px solid #e5e7eb',
                  background: index % 2 === 0 ? 'white' : '#f9fafb'
                }}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '500' }}>
                    {item.domain.label}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
                    {item.previousScore.toFixed(1)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>
                    {item.latestScore.toFixed(1)}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: item.improvement >= 0 ? '#22c55e' : '#ef4444'
                  }}>
                    {item.improvement >= 0 ? '+' : ''}{item.improvement.toFixed(2)}
                  </td>
                  <td style={{ 
                    padding: '1rem', 
                    textAlign: 'center', 
                    fontSize: '1.25rem'
                  }}>
                    {item.improvement > 0.1 ? '📈' : item.improvement < -0.1 ? '📉' : '➡️'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment History */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '1rem',
          color: '#111827'
        }}>
          Assessment History ({assessments.length} total)
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {assessments.slice().reverse().map((assessment, index) => (
            <div 
              key={assessment.id}
              style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: index === 0 ? '#f0f9ff' : 'white'
              }}
            >
              <div>
                <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>
                  {new Date(assessment.assessment_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {index === 0 && (
                    <span style={{ 
                      marginLeft: '0.5rem',
                      padding: '0.125rem 0.5rem',
                      background: '#3b82f6',
                      color: 'white',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      Latest
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  ID: {assessment.id.slice(0, 8)}
                </div>
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#3b82f6'
              }}>
                {(assessment.overall_score || 0).toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
