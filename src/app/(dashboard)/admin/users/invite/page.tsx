'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function InviteUserPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ email: '', full_name: '', role: 'mentor', password: '' })
  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null); setSaving(true)
    try {
      const res = await fetch('/api/admin/users/create', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed') }
      setSuccess(true)
      setTimeout(() => router.push('/admin/users'), 3000)
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  const inputStyle = { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' as const }

  if (success) return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center'}}>
      <div style={{fontSize: '3rem'}}>✅</div>
      <h2>User Created!</h2>
      <p>Email: {form.email} / Password: {form.password}</p>
      <p style={{color: '#9ca3af'}}>Redirecting...</p>
    </div>
  )

  return (
    <div style={{padding: '2rem', maxWidth: '600px', margin: '0 auto'}}>
      <Link href="/admin/users" style={{color: '#667eea', textDecoration: 'none'}}>← Back to Users</Link>
      <div style={{background: 'white', borderRadius: '12px', padding: '2rem', marginTop: '1rem'}}>
        <h1 style={{fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem'}}>Invite New User</h1>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Full Name *</label><input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)} required style={inputStyle} /></div>
          <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Email *</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} required style={inputStyle} /></div>
          <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Password *</label><input type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} style={inputStyle} /></div>
          <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Role *</label>
            <select value={form.role} onChange={e => update('role', e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
              <option value="mentor">Mentor</option>
              <option value="school_admin">School Admin</option>
              <option value="acsi_admin">ACSI Admin</option>
            </select>
          </div>
          {error && <div style={{background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px'}}>{error}</div>}
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
            <Link href="/admin/users" style={{padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', textDecoration: 'none', color: '#374151'}}>Cancel</Link>
            <button type="submit" disabled={saving} style={{padding: '0.75rem 2rem', background: saving ? '#d1d5db' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer'}}>{saving ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
