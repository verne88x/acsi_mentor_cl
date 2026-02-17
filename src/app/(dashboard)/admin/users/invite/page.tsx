'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InviteUserPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const [form, setForm] = useState({
    email: '',
    full_name: '',
    role: 'mentor',
    password: '',
  })

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Step 1: Create user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            role: form.role,
          }
        }
      })

      if (signUpError) throw signUpError

      // Step 2: Update profile via raw SQL approach
      if (data.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: form.role as 'mentor' | 'school_admin' | 'acsi_admin', 
            full_name: form.full_name 
          })
          .eq('id', data.user.id)
          .select()
        
        // Ignore update error - trigger will handle role from metadata
        console.log('Profile update:', updateError?.message || 'ok')
      }

      setSuccessMsg(`User ${form.email} created! Share the password: ${form.password}`)
      setSuccess(true)
      setTimeout(() => router.push('/admin/users'), 4000)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    width: '100%',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  }

  if (success) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', margin: '0 0 1rem 0' }}>User Created!</h2>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', textAlign: 'left' }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.875rem' }}>{successMsg}</p>
          </div>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>Redirecting to users list in 4 seconds...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <Link href="/admin/users" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
        ← Back to Users
      </Link>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.5rem 0' }}>
          Invite New User
        </h1>
        <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
          Create a new mentor or school admin account
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Full Name *
            </label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => update('full_name', e.target.value)}
              placeholder="e.g. John Kamau"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Email Address *
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => update('email', e.target.value)}
              placeholder="john@example.com"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Temporary Password *
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => update('password', e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              style={inputStyle}
            />
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: '0.25rem 0 0 0' }}>
              Share this password with the user - they can change it later
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.5rem' }}>
              Role *
            </label>
            <select
              value={form.role}
              onChange={e => update('role', e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="mentor">Mentor</option>
              <option value="school_admin">School Admin</option>
              <option value="acsi_admin">ACSI Admin</option>
            </select>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
            <Link
              href="/admin/users"
              style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !form.email || !form.password}
              style={{
                padding: '0.75rem 2rem',
                background: saving || !form.email || !form.password ? '#d1d5db' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: saving || !form.email || !form.password ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
