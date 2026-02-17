'use client'

import { useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './new-school.module.css'

export default function NewSchoolPage() {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
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

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const { error } = await supabase
        .from('schools')
        .insert({
          name: form.name,
          county: form.county || null,
          town: form.town || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          head_teacher: form.head_teacher || null,
          student_count: form.student_count ? parseInt(form.student_count) : null,
          staff_count: form.staff_count ? parseInt(form.staff_count) : null,
        } as any)

      if (error) throw error

      router.push('/admin/schools')
    } catch (err: any) {
      setError(err.message || 'Failed to create school')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <Link href="/admin/schools" className={styles.backButton}>
        ← Back to Schools
      </Link>

      <div className={styles.card}>
        <h1>Add New School</h1>
        <p className={styles.subtitle}>Register a new school in the platform</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.section}>
            <h2>Basic Information</h2>
            
            <div className={styles.field}>
              <label htmlFor="name">School Name *</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="e.g. Nairobi Christian Academy"
                required
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="county">County</label>
                <input
                  id="county"
                  type="text"
                  value={form.county}
                  onChange={e => update('county', e.target.value)}
                  placeholder="e.g. Nairobi"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="town">Town</label>
                <input
                  id="town"
                  type="text"
                  value={form.town}
                  onChange={e => update('town', e.target.value)}
                  placeholder="e.g. Westlands"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="address">Address</label>
              <input
                id="address"
                type="text"
                value={form.address}
                onChange={e => update('address', e.target.value)}
                placeholder="Full address"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>Contact Information</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+254 700 000 000"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="school@example.com"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="head_teacher">Head Teacher</label>
              <input
                id="head_teacher"
                type="text"
                value={form.head_teacher}
                onChange={e => update('head_teacher', e.target.value)}
                placeholder="Full name"
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2>School Size</h2>

            <div className={styles.row}>
              <div className={styles.field}>
                <label htmlFor="student_count">Number of Students</label>
                <input
                  id="student_count"
                  type="number"
                  value={form.student_count}
                  onChange={e => update('student_count', e.target.value)}
                  placeholder="e.g. 450"
                  min="0"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="staff_count">Number of Staff</label>
                <input
                  id="staff_count"
                  type="number"
                  value={form.staff_count}
                  onChange={e => update('staff_count', e.target.value)}
                  placeholder="e.g. 30"
                  min="0"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <div className={styles.actions}>
            <Link href="/admin/schools" className={styles.cancelButton}>
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !form.name}
              className={styles.submitButton}
            >
              {saving ? 'Saving...' : 'Create School'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
