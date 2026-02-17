'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Profile {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, created_at')
      .order('created_at', { ascending: false })
    setUsers((data || []) as Profile[])
    setLoading(false)
  }

  async function updateRole(userId: string, newRole: string) {
    setUpdating(userId)
    try {
      // Use a direct fetch to Supabase REST API to bypass TypeScript issues
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      const { data: { session } } = await supabase.auth.getSession()
      
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      await loadUsers()
    } catch (err) {
      console.error('Error updating role:', err)
    } finally {
      setUpdating(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'acsi_admin': return { background: '#ede9fe', color: '#6d28d9' }
      case 'mentor': return { background: '#d1fae5', color: '#065f46' }
      default: return { background: '#dbeafe', color: '#1e40af' }
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'acsi_admin': return 'Admin'
      case 'mentor': return 'Mentor'
      case 'school_admin': return 'School Admin'
      default: return role
    }
  }

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.5rem 0' }}>Users</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Manage all users and their roles</p>
        </div>
        <Link href="/admin/users/invite" style={{ padding: '0.75rem 1.5rem', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 600 }}>
          + Invite User
        </Link>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Email</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Role</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Joined</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Change Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: '1px solid #f3f4f6' }}>
                <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: '#1f2937' }}>{user.full_name || '—'}</td>
                <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>{user.email}</td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, ...getRoleColor(user.role) }}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', color: '#6b7280' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <select
                    value={user.role}
                    disabled={updating === user.id}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                    style={{ padding: '0.375rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.875rem', color: '#374151', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <option value="school_admin">School Admin</option>
                    <option value="mentor">Mentor</option>
                    <option value="acsi_admin">Admin</option>
                  </select>
                  {updating === user.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>Saving...</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            No users found. <Link href="/admin/users/invite" style={{ color: '#667eea' }}>Invite your first user!</Link>
          </div>
        )}
      </div>
    </div>
  )
}
