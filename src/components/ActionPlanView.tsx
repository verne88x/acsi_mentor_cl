'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ActionPlan, ActionItem } from '@/types'

interface ActionPlanViewProps {
  plan: ActionPlan & {
    school: any
    action_items: ActionItem[]
    creator: any
  }
}

export default function ActionPlanView({ plan }: ActionPlanViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const [updating, setUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e'
      case 'completed': return '#3b82f6'
      case 'archived': return '#6b7280'
      default: return '#eab308'
    }
  }

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e'
      case 'in_progress': return '#eab308'
      case 'blocked': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 1: return 'High'
      case 2: return 'Medium'
      case 3: return 'Low'
      default: return 'Not set'
    }
  }

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const session = await supabase.auth.getSession()
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      const response = await fetch(`${supabaseUrl}/rest/v1/action_items?id=eq.${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey!,
          'Authorization': `Bearer ${session?.data.session?.access_token}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update')

      router.refresh()
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  // Group items by domain
  const itemsByDomain = plan.action_items.reduce((acc, item) => {
    if (!acc[item.domain]) {
      acc[item.domain] = []
    }
    acc[item.domain].push(item)
    return acc
  }, {} as Record<string, ActionItem[]>)

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '2rem',
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
              {plan.title}
            </h1>
            <p style={{
              color: '#6b7280',
              margin: 0
            }}>
              {plan.school.name}
            </p>
          </div>
          <span style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            fontSize: '0.875rem',
            fontWeight: '600',
            background: `${getStatusColor(plan.status)}20`,
            color: getStatusColor(plan.status)
          }}>
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </span>
        </div>

        {plan.description && (
          <p style={{
            color: '#374151',
            marginBottom: '1rem'
          }}>
            {plan.description}
          </p>
        )}

        <div style={{
          display: 'flex',
          gap: '2rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          <div>
            <strong>Created:</strong> {new Date(plan.created_at).toLocaleDateString()}
          </div>
          {plan.start_date && (
            <div>
              <strong>Start:</strong> {new Date(plan.start_date).toLocaleDateString()}
            </div>
          )}
          {plan.end_date && (
            <div>
              <strong>End:</strong> {new Date(plan.end_date).toLocaleDateString()}
            </div>
          )}
          <div>
            <strong>By:</strong> {plan.creator?.full_name || plan.creator?.email}
          </div>
        </div>
      </div>

      {/* Action Items by Domain */}
      <div>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem'
        }}>
          Action Items ({plan.action_items.length})
        </h2>

        {Object.entries(itemsByDomain).map(([domain, items]) => (
          <div
            key={domain}
            style={{
              marginBottom: '2rem',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <div style={{
              background: '#f9fafb',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0
              }}>
                {domain.replace(/_/g, ' ')}
              </h3>
            </div>

            <div>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    marginBottom: '0.75rem'
                  }}>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      disabled={updating}
                      style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #d1d5db',
                        fontSize: '0.875rem',
                        background: `${getItemStatusColor(item.status)}20`,
                        color: getItemStatusColor(item.status),
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: item.priority === 1 ? '#fef2f2' : item.priority === 2 ? '#fef9c3' : '#f3f4f6',
                      color: item.priority === 1 ? '#dc2626' : item.priority === 2 ? '#ca8a04' : '#6b7280'
                    }}>
                      {getPriorityLabel(item.priority)}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '1rem',
                    marginBottom: '0.75rem',
                    color: '#111827'
                  }}>
                    {item.description}
                  </p>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#6b7280'
                  }}>
                    {item.owner_name && (
                      <div>
                        <strong>Owner:</strong> {item.owner_name}
                      </div>
                    )}
                    {item.kpi && (
                      <div>
                        <strong>KPI:</strong> {item.kpi}
                      </div>
                    )}
                    {item.due_date && (
                      <div>
                        <strong>Due:</strong> {new Date(item.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem',
                      background: '#f9fafb',
                      borderRadius: '4px',
                      fontSize: '0.875rem'
                    }}>
                      <strong>Notes:</strong> {item.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '8px'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          marginBottom: '1rem'
        }}>
          Progress Summary
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Items</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{plan.action_items.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#22c55e' }}>
              {plan.action_items.filter(i => i.status === 'completed').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>In Progress</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#eab308' }}>
              {plan.action_items.filter(i => i.status === 'in_progress').length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Pending</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#6b7280' }}>
              {plan.action_items.filter(i => i.status === 'pending').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
