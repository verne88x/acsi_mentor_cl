'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Profile { id: string; email: string; full_name: string | null }
interface Member { id: string; user_id: string; full_name: string | null; email: string }

export default function SchoolMentorsPage({ params }: { params: { id: string } }) {
  const [school, setSchool] = useState<any>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [available, setAvailable] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [schoolRes, membersRes] = await Promise.all([fetch(`/api/schools/${params.id}`), fetch(`/api/schools/${params.id}/members`)])
    const schoolData = await schoolRes.json()
    const { members: m, mentors } = await membersRes.json()
    setSchool(schoolData)
    setMembers(m || [])
    const assignedIds = (m || []).map((x: any) => x.user_id)
    setAvailable((mentors || []).filter((x: any) => !assignedIds.includes(x.id)))
    setLoading(false)
  }

  async function assignMentor(userId: string) {
    setAdding(true)
    await fetch(`/api/schools/${params.id}/members`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ user_id: userId }) })
    await loadData(); setAdding(false)
  }

  async function removeMentor(memberId: string) {
    if (!confirm('Remove this mentor?')) return
    await fetch(`/api/schools/${params.id}/members`, { method: 'DELETE', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ member_id: memberId }) })
    await loadData()
  }

  if (loading) return <div style={{padding: '4rem', textAlign: 'center', color: '#6b7280'}}>Loading...</div>

  return (
    <div style={{padding: '2rem', maxWidth: '1000px', margin: '0 auto'}}>
      <Link href="/admin/schools" style={{color: '#667eea', textDecoration: 'none'}}>← Back to Schools</Link>
      <h1 style={{fontSize: '1.875rem', fontWeight: 700, margin: '1rem 0 0.5rem 0'}}>Assign Mentors</h1>
      <p style={{color: '#6b7280', marginBottom: '2rem'}}>{school?.name}</p>
      <div style={{background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb', marginBottom: '1.5rem'}}>
        <h2 style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem'}}>Assigned ({members.length})</h2>
        {members.length === 0 ? <p style={{color: '#9ca3af'}}>No mentors assigned yet</p> : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {members.map((m: any) => (
              <div key={m.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px'}}>
                <div><div style={{fontWeight: 500}}>{m.full_name || 'Unnamed'}</div><div style={{fontSize: '0.875rem', color: '#6b7280'}}>{m.email}</div></div>
                <button onClick={() => removeMentor(m.id)} style={{padding: '0.5rem 1rem', background: 'white', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer'}}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e5e7eb'}}>
        <h2 style={{fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem'}}>Available ({available.length})</h2>
        {available.length === 0 ? <p style={{color: '#9ca3af'}}>All mentors assigned. <Link href="/admin/users/invite" style={{color: '#667eea'}}>Create new mentor</Link></p> : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {available.map((m: any) => (
              <div key={m.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px'}}>
                <div><div style={{fontWeight: 500}}>{m.full_name || 'Unnamed'}</div><div style={{fontSize: '0.875rem', color: '#6b7280'}}>{m.email}</div></div>
                <button onClick={() => assignMentor(m.id)} disabled={adding} style={{padding: '0.5rem 1rem', background: adding ? '#d1d5db' : '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: adding ? 'not-allowed' : 'pointer'}}>Assign</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
