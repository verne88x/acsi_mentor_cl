'use client'

import Link from 'next/link'

export interface RiskAlert {
  id: string
  school_id: string
  school_name: string
  type: 'no_recent_assessment' | 'low_standard' | 'declining_score' | 'no_action_plan'
  severity: 'high' | 'medium' | 'low'
  message: string
  details?: any
  created_at: Date
}

function getSeverityColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high': return '#ef4444'
    case 'medium': return '#f59e0b'
    case 'low': return '#eab308'
  }
}

function getSeverityBgColor(severity: 'high' | 'medium' | 'low'): string {
  switch (severity) {
    case 'high': return '#fee2e2'
    case 'medium': return '#fed7aa'
    case 'low': return '#fef9c3'
  }
}

function getAlertIcon(type: RiskAlert['type']): string {
  switch (type) {
    case 'no_recent_assessment': return '📅'
    case 'low_standard': return '⚠️'
    case 'declining_score': return '📉'
    case 'no_action_plan': return '📋'
    default: return '🔔'
  }
}

interface RiskAlertsDashboardProps {
  alerts: RiskAlert[]
}

export default function RiskAlertsDashboard({ alerts }: RiskAlertsDashboardProps) {
  const highAlerts = alerts.filter(a => a.severity === 'high')
  const mediumAlerts = alerts.filter(a => a.severity === 'medium')
  const lowAlerts = alerts.filter(a => a.severity === 'low')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          padding: '1.5rem',
          background: '#fee2e2',
          borderRadius: '8px',
          border: '2px solid #ef4444'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            High Priority
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>
            {highAlerts.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Needs immediate attention
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#fed7aa',
          borderRadius: '8px',
          border: '2px solid #f59e0b'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Medium Priority
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {mediumAlerts.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Requires follow-up
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: '#fef9c3',
          borderRadius: '8px',
          border: '2px solid #eab308'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Low Priority
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#eab308' }}>
            {lowAlerts.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            Monitor closely
          </div>
        </div>

        <div style={{
          padding: '1.5rem',
          background: alerts.length === 0 ? '#dcfce7' : '#f3f4f6',
          borderRadius: '8px',
          border: alerts.length === 0 ? '2px solid #22c55e' : '2px solid #d1d5db'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            Total Alerts
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: alerts.length === 0 ? '#22c55e' : '#6b7280'
          }}>
            {alerts.length}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {alerts.length === 0 ? 'All clear! 🎉' : 'Across all schools'}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <div style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#111827' }}>
            No Risk Alerts
          </div>
          <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
            All schools are in good standing. Keep up the great work!
          </div>
        </div>
      ) : (
        <>
          {/* High Priority Alerts */}
          {highAlerts.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔴 High Priority ({highAlerts.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {highAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Medium Priority Alerts */}
          {mediumAlerts.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🟡 Medium Priority ({mediumAlerts.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {mediumAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Low Priority Alerts */}
          {lowAlerts.length > 0 && (
            <div>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: '#eab308',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚠️ Low Priority ({lowAlerts.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {lowAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  )
}

function AlertCard({ alert }: { alert: RiskAlert }) {
  return (
    <Link
      href={`/schools/${alert.school_id}`}
      style={{
        display: 'block',
        padding: '1.25rem',
        background: getSeverityBgColor(alert.severity),
        border: `2px solid ${getSeverityColor(alert.severity)}`,
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>
              {getAlertIcon(alert.type)}
            </span>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: 0,
              color: '#111827'
            }}>
              {alert.school_name}
            </h3>
          </div>
          
          <p style={{
            fontSize: '0.9375rem',
            margin: '0 0 0.5rem 0',
            color: '#374151',
            fontWeight: '500'
          }}>
            {alert.message}
          </p>

          {alert.details && (
            <div style={{
              fontSize: '0.8125rem',
              color: '#6b7280',
              marginTop: '0.5rem'
            }}>
              {alert.type === 'low_standard' && alert.details.standards && (
                <div>
                  <strong>Low standards:</strong> {alert.details.standards.join(', ')}
                </div>
              )}
              {alert.type === 'declining_score' && alert.details.previous && alert.details.current && (
                <div>
                  <strong>Score change:</strong> {alert.details.previous} → {alert.details.current}
                </div>
              )}
              {alert.type === 'no_recent_assessment' && alert.details.last_assessment_date && (
                <div>
                  <strong>Last assessment:</strong> {new Date(alert.details.last_assessment_date).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: getSeverityColor(alert.severity),
          color: 'white',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap'
        }}>
          {alert.severity}
        </div>
      </div>
    </Link>
  )
}
