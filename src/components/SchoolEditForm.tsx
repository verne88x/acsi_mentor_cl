'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { School } from '@/types'

interface SchoolEditFormProps {
  school: School
}

export default function SchoolEditForm({ school }: SchoolEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: school.name,
    county: school.county || '',
    town: school.town || '',
    address: school.address || '',
    phone: school.phone || '',
    email: school.email || '',
    head_teacher: school.head_teacher || '',
    student_count: school.student_count || '',
    staff_count: school.staff_count || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('schools')
        .update({
          name: formData.name,
          county: formData.county || null,
          town: formData.town || null,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          head_teacher: formData.head_teacher || null,
          student_count: formData.student_count ? parseInt(formData.student_count as string) : null,
          staff_count: formData.staff_count ? parseInt(formData.staff_count as string) : null,
        } as any)
        .eq('id', school.id)

      if (error) throw error

      router.push(`/schools/${school.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error updating school:', error)
      alert('Failed to update school. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '1rem',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#374151',
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* School Name */}
        <div>
          <label style={labelStyle}>
            School Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={inputStyle}
            placeholder="Enter school name"
          />
        </div>

        {/* Location */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>County</label>
            <input
              type="text"
              value={formData.county}
              onChange={(e) => setFormData({ ...formData, county: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Nairobi"
            />
          </div>
          <div>
            <label style={labelStyle}>Town/City</label>
            <input
              type="text"
              value={formData.town}
              onChange={(e) => setFormData({ ...formData, town: e.target.value })}
              style={inputStyle}
              placeholder="e.g., Nairobi"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label style={labelStyle}>Physical Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            style={{
              ...inputStyle,
              resize: 'vertical',
            }}
            placeholder="Street address or location details"
          />
        </div>

        {/* Contact */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              style={inputStyle}
              placeholder="e.g., +254 712 345678"
            />
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={inputStyle}
              placeholder="school@example.com"
            />
          </div>
        </div>

        {/* Head Teacher */}
        <div>
          <label style={labelStyle}>Head Teacher</label>
          <input
            type="text"
            value={formData.head_teacher}
            onChange={(e) => setFormData({ ...formData, head_teacher: e.target.value })}
            style={inputStyle}
            placeholder="Name of head teacher"
          />
        </div>

        {/* Student & Staff Count */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Number of Students</label>
            <input
              type="number"
              min="0"
              value={formData.student_count}
              onChange={(e) => setFormData({ ...formData, student_count: e.target.value })}
              style={inputStyle}
              placeholder="e.g., 250"
            />
          </div>
          <div>
            <label style={labelStyle}>Number of Staff</label>
            <input
              type="number"
              min="0"
              value={formData.staff_count}
              onChange={(e) => setFormData({ ...formData, staff_count: e.target.value })}
              style={inputStyle}
              placeholder="e.g., 15"
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              background: saving ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/schools/${school.id}`)}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
