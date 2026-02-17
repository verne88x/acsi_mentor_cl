'use client'

import { useState, useEffect, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditSchoolPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    county: '',
    town: '',
    address: '',
    phone: '',
    email: '',
    head_teacher: '',
    student_count: '',
    staff_count: '',
  })

  useEffect(() => {
    loadSchool()
  }, [])

  async function loadSchool() {
    const { data } = await supabase
      .from('schools')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (data) {
      setForm({
        name: data.name || '',
        county: data.county || '',
        town: data.town || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        head_teacher: data.head_teacher || '',
        student_count: data.student_count?.toString() || '',
        staff_count: data.staff_count?.toString() || '',
      })
    }
    setLoading(false)
  }

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // Use direct fetch to bypass TypeScript issues
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(`${supabaseUrl}/rest/v1/schools?id=eq.${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          name: form.name,
          county: form.county || null,
          town: form.town || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          head_teacher: form.head_teacher || null,
          student_count: form.student_count ? parseInt(form.student_count) : null,
          staff_count: form.staff_count ? parseInt(form.staff_count) : null,
        })
      })

      if (!response.ok) throw new Error('Failed to update school')
      router.push('/admin/schools')
    } catch (err: any) {
      setError(err.message || 'Failed to update school')
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

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '0.5rem',
  }

  const fieldStyle = {
    marginBottom: '1rem',
  }

  const sectionStyle = {
    marginBottom: '2rem',
    paddingBottom: '2rem',
    borderBottom: '1px solid #e5e7eb',
  }

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Link href="/admin/schools" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
        ← Back to Schools
      </Link>

      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.5rem 0' }}>
          Edit School
        </h1>
        <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
          Update school information
        </p>

        <form onSubmit={handleSubmit}>
          <div style={sectionStyle}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Basic Information</h2>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="name">School Name *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="county">County</label>
                <input
                  id="county"
                  type="text"
                  value={form.county}
                  onChange={e => update('county', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="town">Town</label>
                <input
                  id="town"
                  type="text"
                  value={form.town}
                  onChange={e => update('town', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={e => update('address', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Contact Information</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={fieldStyle}>
              <label style={labelStyle} htmlFor="head_teacher">Head Teacher</label>
              <input
                id="head_teacher"
                type="text"
                value={form.head_teacher}
                onChange={e => update('head_teacher', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={sectionStyle}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>School Size</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="student_count">Number of Students</label>
                <input
                  id="student_count"
                  type="number"
                  value={form.student_count}
                  onChange={e => update('student_count', e.target.value)}
                  min="0"
                  style={inputStyle}
                />
              </div>
              <div style={fieldStyle}>
                <label style={labelStyle} htmlFor="staff_count">Number of Staff</label>
                <input
                  id="staff_count"
                  type="number"
                  value={form.staff_count}
                  onChange={e => update('staff_count', e.target.value)}
                  min="0"
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <Link
              href="/admin/schools"
              style={{ padding: '0.75rem 1.5rem', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !form.name}
              style={{
                padding: '0.75rem 2rem',
                background: saving || !form.name ? '#d1d5db' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: saving || !form.name ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
