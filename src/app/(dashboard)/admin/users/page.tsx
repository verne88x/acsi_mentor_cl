'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const REGIONS = ['Nairobi Region', 'North Rift Region', 'South Rift Region', 'Nyanza Region', 'Western Region', 'Coast Region', 'Eastern Region']

interface Profile { id: string; email: string; full_name: string | null; role: string; region: string | null }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    const res = await fetch('/api/admin/users')
    setUsers(await res.json() || [])
    setLoading(false)
  }

  async function updateField(userId: string, field: string, value: string) {
    setUpdating(userId)
    await fetch(`/api/admin/users/${userId}`, { method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ [field]: value }) })
    await loadUsers()
    setUpdating(null)
  }

  const getRoleColor = (role: string) => ({
    acsi_admin: {background:'#ede9fe',color:'#6d28d9'},
    regional_manager: {background:'#fef3c7',color:'#92400e'},
    mentor: {background:'#d1fae5',color:'#065f46'}
  } as any)[role] || {background:'#dbeafe',color:'#1e40af'}

  if (loading) return <div style={{padding:'4rem',textAlign:'center',color:'#6b7280'}}>Loading...</div>

  return (
    <div style={{padding:'2rem',maxWidth:'1400px',margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.875rem',fontWeight:700}}>Users</h1>
        <Link href="/admin/users/invite" style={{padding:'0.75rem 1.5rem',background:'#667eea',color:'white',textDecoration:'none',borderRadius:'8px',fontWeight:600}}>+ Invite User</Link>
      </div>
      <div style={{background:'white',borderRadius:'12px',border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#f9fafb'}}>
            <tr>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Name</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Email</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Role</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Region</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{borderTop:'1px solid #f3f4f6'}}>
                <td style={{padding:'1rem 1.5rem',fontWeight:500}}>{user.full_name || '—'}</td>
                <td style={{padding:'1rem 1.5rem',color:'#6b7280'}}>{user.email}</td>
                <td style={{padding:'1rem 1.5rem'}}>
                  <span style={{padding:'0.25rem 0.75rem',borderRadius:'999px',fontSize:'0.75rem',fontWeight:600,...getRoleColor(user.role)}}>{user.role}</span>
                </td>
                <td style={{padding:'1rem 1.5rem'}}>
                  {['regional_manager', 'mentor'].includes(user.role) ? (
                    <select value={user.region || ''} disabled={updating === user.id}
                      onChange={(e) => updateField(user.id, 'region', e.target.value)}
                      style={{padding:'0.375rem 0.75rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'0.875rem'}}>
                      <option value="">— No Region —</option>
                      {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  ) : (
                    <span style={{color:'#9ca3af',fontSize:'0.875rem'}}>—</span>
                  )}
                </td>
                <td style={{padding:'1rem 1.5rem'}}>
                  <select value={user.role} disabled={updating === user.id}
                    onChange={(e) => updateField(user.id, 'role', e.target.value)}
                    style={{padding:'0.375rem 0.75rem',border:'1px solid #d1d5db',borderRadius:'6px',fontSize:'0.875rem'}}>
                    <option value="school_admin">School Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="regional_manager">Regional Manager</option>
                    <option value="acsi_admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
