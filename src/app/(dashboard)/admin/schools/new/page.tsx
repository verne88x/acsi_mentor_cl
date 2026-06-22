'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewSchoolPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', county: '', town: '', address: '', phone: '', email: '', head_teacher: '', student_count: '', staff_count: '', region: '' })
  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }))
  const inputStyle = { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' as const }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setError(null); setSaving(true)
    try {
      const res = await fetch('/api/schools', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ ...form, student_count: form.student_count ? parseInt(form.student_count) : null, staff_count: form.staff_count ? parseInt(form.staff_count) : null }) })
      if (!res.ok) throw new Error('Failed to create school')
      router.push('/admin/schools')
    } catch (err: any) { setError(err.message) } finally { setSaving(false) }
  }

  return (
    <div style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
      <Link href="/admin/schools" style={{color: '#667eea', textDecoration: 'none'}}>← Back to Schools</Link>
      <div style={{background: 'white', borderRadius: '12px', padding: '2rem', marginTop: '1rem'}}>
        <h1 style={{fontSize: '1.875rem', fontWeight: 700, marginBottom: '1.5rem'}}>Add New School</h1>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>School Name *</label><input type="text" value={form.name} onChange={e => update('name', e.target.value)} required style={inputStyle} /></div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>County</label><input type="text" value={form.county} onChange={e => update('county', e.target.value)} style={inputStyle} /></div>
            <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Town</label><input type="text" value={form.town} onChange={e => update('town', e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Head Teacher</label><input type="text" value={form.head_teacher} onChange={e => update('head_teacher', e.target.value)} style={inputStyle} /></div>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
            <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Students</label><input type="number" value={form.student_count} onChange={e => update('student_count', e.target.value)} min="0" style={inputStyle} /></div>
            <div><label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Staff</label><input type="number" value={form.staff_count} onChange={e => update('staff_count', e.target.value)} min="0" style={inputStyle} /></div>
          </div>
          {error && <div style={{background: '#fef2f2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px'}}>{error}</div>}
          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
            <Link href="/admin/schools" style={{padding: '0.75rem 1.5rem', border: '1px solid #d1d5db', borderRadius: '8px', textDecoration: 'none', color: '#374151'}}>Cancel</Link>
            <button type="submit" disabled={saving || !form.name} style={{padding: '0.75rem 2rem', background: saving || !form.name ? '#d1d5db' : '#667eea', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: saving || !form.name ? 'not-allowed' : 'pointer'}}>{saving ? 'Saving...' : 'Create School'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
