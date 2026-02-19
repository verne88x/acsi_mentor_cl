'use client'

import { useState } from 'react'
import Link from 'next/link'
import RiskAlertsDashboard from './RiskAlertsDashboard'
import styles from './TabbedMentorDashboard.module.css'

type Tab = 'overview' | 'alerts' | 'requests' | 'schools'

interface TabbedMentorDashboardProps {
  schools: any[]
  alerts: any[]
  requests: any[]
  stats: {
    totalSchools: number
    averageScore: string
    highAlerts: number
    pendingRequests: number
  }
}

export default function TabbedMentorDashboard({ 
  schools, 
  alerts, 
  requests,
  stats 
}: TabbedMentorDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs = [
    { id: 'overview' as Tab, label: '🏠 Overview', count: null },
    { id: 'alerts' as Tab, label: '🚨 Alerts', count: alerts.length },
    { id: 'requests' as Tab, label: '📋 Requests', count: requests.length },
    { id: 'schools' as Tab, label: '🏫 Schools', count: schools.length },
  ]

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          Mentor Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Manage schools, track progress, and respond to alerts
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '1rem 1.5rem',
              background: activeTab === tab.id ? 'white' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === tab.id ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === tab.id ? '600' : '500',
              fontSize: '0.9375rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
            {tab.count !== null && (
              <span style={{
                marginLeft: '0.5rem',
                padding: '0.125rem 0.5rem',
                background: activeTab === tab.id ? '#3b82f6' : '#e5e7eb',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <OverviewTab stats={stats} alerts={alerts} requests={requests} />}
        {activeTab === 'alerts' && <RiskAlertsDashboard alerts={alerts} />}
        {activeTab === 'requests' && <RequestsTab requests={requests} />}
        {activeTab === 'schools' && <SchoolsTab schools={schools} />}
      </div>
    </div>
  )
}

// OVERVIEW TAB
function OverviewTab({ stats, alerts, requests }: any) {
  const recentAlerts = alerts.slice(0, 3)
  const recentRequests = requests.slice(0, 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1rem'
      }}>
        <StatCard
          icon="🏫"
          label="Total Schools"
          value={stats.totalSchools}
          color="#3b82f6"
        />
        <StatCard
          icon="📊"
          label="Average Score"
          value={stats.averageScore}
          color="#10b981"
        />
        <StatCard
          icon="🚨"
          label="High Priority Alerts"
          value={stats.highAlerts}
          color="#ef4444"
        />
        <StatCard
          icon="📋"
          label="Pending Requests"
          value={stats.pendingRequests}
          color="#f59e0b"
        />
      </div>

      {/* Recent Alerts */}
      {recentAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Recent Alerts
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentAlerts.map((alert: any) => (
              <Link
                key={alert.id}
                href={`/schools/${alert.school_id}`}
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {alert.school_name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {alert.message}
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem' }}>→</span>
              </Link>
            ))}
          </div>
          {alerts.length > 3 && (
            <button
              onClick={() => {}}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#3b82f6',
                fontWeight: '500'
              }}
            >
              View all {alerts.length} alerts
            </button>
          )}
        </div>
      )}

      {/* Recent Requests */}
      {recentRequests.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
            Recent Consultation Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentRequests.map((request: any) => (
              <Link
                key={request.id}
                href={`/consulting-requests/${request.id}`}
                style={{
                  padding: '1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {request.school.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {new Date(request.created_at).toLocaleDateString()} • {request.status}
                  </div>
                </div>
                <span style={{ fontSize: '1.5rem' }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{
      padding: '1.5rem',
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
        {label}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
        {value}
      </div>
    </div>
  )
}

// REQUESTS TAB
function RequestsTab({ requests }: any) {
  const [filter, setFilter] = useState<string>('all')
  
  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter((r: any) => r.status === filter)

  const statusCounts = {
    all: requests.length,
    pending: requests.filter((r: any) => r.status === 'pending').length,
    reviewed: requests.filter((r: any) => r.status === 'reviewed').length,
    contacted: requests.filter((r: any) => r.status === 'contacted').length,
    completed: requests.filter((r: any) => r.status === 'completed').length,
  }

  return (
    <div>
      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '0.5rem 1rem',
              background: filter === status ? '#3b82f6' : 'white',
              color: filter === status ? 'white' : '#6b7280',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              textTransform: 'capitalize'
            }}
          >
            {status} ({count})
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          No {filter !== 'all' && filter} consultation requests
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredRequests.map((request: any) => (
            <Link
              key={request.id}
              href={`/consulting-requests/${request.id}`}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.0625rem' }}>
                  {request.school.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  {request.school.town}, {request.school.county}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                  {new Date(request.created_at).toLocaleDateString()} • {request.timeline || 'No timeline'}
                </div>
              </div>
              <div style={{
                padding: '0.25rem 0.75rem',
                background: '#f3f4f6',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}>
                {request.status}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// SCHOOLS TAB
function SchoolsTab({ schools }: any) {
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredSchools = schools.filter((school: any) =>
    school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.town?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.county?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      {/* Search */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search schools..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Schools Grid */}
      {filteredSchools.length === 0 ? (
        <div style={{
          padding: '3rem',
          textAlign: 'center',
          background: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          No schools found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {filteredSchools.map((school: any) => (
            <Link
              key={school.id}
              href={`/schools/${school.id}`}
              style={{
                padding: '1.5rem',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s'
              }}
            >
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#111827'
              }}>
                {school.name}
              </h3>
              <div style={{
                fontSize: '0.875rem',
                color: '#6b7280',
                marginBottom: '1rem'
              }}>
                {school.town}, {school.county}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#3b82f6',
                fontWeight: '500'
              }}>
                <span>View Details</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
