'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface School {
  id: string
  name: string
}

interface Profile {
  id: string
  email: string
  full_name: string | null
}

interface SchoolMember {
  id: string
  user_id: string
  profiles: Profile
}

export default function SchoolMentorsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [school, setSchool] = useState<School | null>(null)
  const [assignedMentors, setAssignedMentors] = useState<SchoolMember[]>([])
  const [availableMentors, setAvailableMentors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    // Load school
    const { data: schoolData } = await supabase
      .from('schools')
      .select('id, name')
      .eq('id', params.id)
      .single()
    setSchool(schoolData as School | null)

    // Load assigned mentors
    const { data: members } = await supabase
      .from('school_members')
      .select('id, user_id, profiles(id, email, full_name)')
      .eq('school_id', params.id)
    setAssignedMentors((members || []) as SchoolMember[])

    // Load all mentors
    const { data: allMentors } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'mentor')
    
    // Filter out already assigned
    const assignedIds = (members || []).map((m: any) => m.user_id)
    const available = (allMentors || []).filter((m: any) => !assignedIds.includes(m.id))
    setAvailableMentors(available as Profile[])

    setLoading(false)
  }

  async function assignMentor(mentorId: string) {
    setAdding(true)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const { data: { session } } = await supabase.auth.getSession()
      
      await fetch(`${supabaseUrl}/rest/v1/school_members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey || '',
          'Authorization': `Bearer ${session?.access_token || ''}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          school_id: params.id,
          user_id: mentorId,
          role: 'mentor'
        })
      })

      await loadData()
    } catch (err) {
      console.error('Error assigning mentor:', err)
    } finally {
      setAdding(false)
    }
  }

  async function removeMentor(memberId: string) {
    if (!confirm('Remove this mentor from the school?')) return

    try {
      await supabase
        .from('school_members')
        .delete()
        .eq('id', memberId)

      await loadData()
    } catch (err) {
      console.error('Error removing mentor:', err)
    }
  }

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Link href="/admin/schools" style={{ color: '#667eea', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
        ← Back to Schools
      </Link>

      <div style={{ marginTop: '1rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#1f2937', margin: '0 0 0.5rem 0' }}>
          Assign Mentors
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          {school?.name}
        </p>
      </div>

      {/* Assigned Mentors */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginTop: '2rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
          Assigned Mentors ({assignedMentors.length})
        </h2>

        {assignedMentors.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>No mentors assigned yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignedMentors.map((member) => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>
                    {member.profiles.full_name || 'Unnamed'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {member.profiles.email}
                  </div>
                </div>
                <button
                  onClick={() => removeMentor(member.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'white',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Mentors */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', marginTop: '1.5rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
          Available Mentors ({availableMentors.length})
        </h2>

        {availableMentors.length === 0 ? (
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            All mentors are assigned. <Link href="/admin/users/invite" style={{ color: '#667eea' }}>Create a new mentor</Link>
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {availableMentors.map((mentor) => (
              <div
                key={mentor.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '8px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, color: '#1f2937' }}>
                    {mentor.full_name || 'Unnamed'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {mentor.email}
                  </div>
                </div>
                <button
                  onClick={() => assignMentor(mentor.id)}
                  disabled={adding}
                  style={{
                    padding: '0.5rem 1rem',
                    background: adding ? '#d1d5db' : '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    cursor: adding ? 'not-allowed' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
