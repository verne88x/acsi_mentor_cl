'use client'

import { useState } from 'react'
import Link from 'next/link'
import RiskAlertsDashboard from './RiskAlertsDashboard'

type Tab = 'overview' | 'schools' | 'alerts' | 'requests' | 'mentors'

export default function AdminDashboard({ schools, alerts, requests, stats }: any) {
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'overview' as Tab, label: '📊 Overview' },
    { id: 'schools' as Tab, label: `🏫 Schools (${schools.length})` },
    { id: 'alerts' as Tab, label: `🚨 Alerts (${alerts.length})` },
    { id: 'requests' as Tab, label: `📋 Requests (${requests.length})` },
    { id: 'mentors' as Tab, label: '👥 Mentors' },
  ]

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ACSI Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Network-wide overview and management
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e5e7eb', marginBottom: '2rem' }}>
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
              cursor: 'pointer',
              marginBottom: '-2px'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <StatCard icon="🏫" label="Total Schools" value={stats.totalSchools} color="#3b82f6" />
            <StatCard icon="📊" label="Network Avg Score" value={stats.averageScore} color="#10b981" />
            <StatCard icon="🚨" label="High Priority Alerts" value={stats.highAlerts} color="#ef4444" />
            <StatCard icon="📋" label="Pending Requests" value={stats.pendingRequests} color="#f59e0b" />
            <StatCard icon="✅" label="Schools w/ Assessments" value={stats.schoolsWithAssessments} color="#8b5cf6" />
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>County Breakdown</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {Object.entries(stats.countyStats).map(([county, data]: any) => (
                <div key={county} style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{county}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {data.count} schools • Avg: {data.assessmentCount > 0 ? (data.totalScore / data.assessmentCount).toFixed(1) : 'N/A'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'schools' && (
        <div>
          <input
            type="text"
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '1.5rem' }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {schools.filter((s: any) => 
              s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.town?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              s.county?.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((school: any) => (
              <Link key={school.id} href={`/schools/${school.id}`} style={{ padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit', background: 'white' }}>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: '600', marginBottom: '0.5rem' }}>{school.name}</h3>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{school.town}, {school.county}</div>
                {school.mentor && (
                  <div style={{ fontSize: '0.8125rem', color: '#3b82f6' }}>
                    Mentor: {school.mentor.full_name || school.mentor.email}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && <RiskAlertsDashboard alerts={alerts} />}

      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {requests.map((req: any) => (
            <Link key={req.id} href={`/consulting-requests/${req.id}`} style={{ padding: '1.25rem', border: '1px solid #e5e7eb', borderRadius: '8px', textDecoration: 'none', color: 'inherit', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{req.school.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{new Date(req.created_at).toLocaleDateString()} • {req.status}</div>
              </div>
              <span>→</span>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'mentors' && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Mentor Assignments</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats.mentorStats).map(([id, data]: any) => (
              <div key={id} style={{ padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', background: 'white' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '1.0625rem' }}>{data.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{data.schoolCount} schools assigned</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div style={{ padding: '1.5rem', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', borderLeft: `4px solid ${color}` }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
    </div>
  )
}
