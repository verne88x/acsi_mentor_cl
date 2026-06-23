'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => { loadSchools() }, [])

  async function loadSchools() {
    const res = await fetch('/api/admin/schools')
    setSchools(await res.json() || [])
    setLoading(false)
  }

  async function deleteSchool(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This will also delete all assessments and visit logs.`)) return
    setDeleting(id)
    await fetch(`/api/schools/${id}`, { method: 'DELETE' })
    await loadSchools()
    setDeleting(null)
  }

  if (loading) return <div style={{padding:'4rem',textAlign:'center',color:'#6b7280'}}>Loading...</div>

  return (
    <div style={{padding:'2rem',maxWidth:'1400px',margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.875rem',fontWeight:700}}>Schools</h1>
        <Link href="/admin/schools/new" style={{padding:'0.75rem 1.5rem',background:'#667eea',color:'white',borderRadius:'8px',textDecoration:'none',fontWeight:600}}>+ Add School</Link>
      </div>
      <div style={{background:'white',borderRadius:'12px',border:'1px solid #e5e7eb',overflow:'hidden'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead style={{background:'#f9fafb'}}>
            <tr>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>School Name</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Region</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Location</th>
              <th style={{padding:'1rem 1.5rem',textAlign:'left'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school: any) => (
              <tr key={school.id} style={{borderTop:'1px solid #f3f4f6'}}>
                <td style={{padding:'1rem 1.5rem',fontWeight:500}}>{school.name}</td>
                <td style={{padding:'1rem 1.5rem',color:'#6b7280'}}>{school.region || '—'}</td>
                <td style={{padding:'1rem 1.5rem',color:'#6b7280'}}>{school.town}, {school.county}</td>
                <td style={{padding:'1rem 1.5rem'}}>
                  <div style={{display:'flex',gap:'0.5rem'}}>
                    <Link href={`/schools/${school.id}`} style={{padding:'0.375rem 0.75rem',background:'#eff6ff',color:'#3b82f6',borderRadius:'6px',textDecoration:'none',fontSize:'0.875rem'}}>View</Link>
                    <Link href={`/admin/schools/${school.id}/edit`} style={{padding:'0.375rem 0.75rem',background:'#f3f4f6',color:'#374151',borderRadius:'6px',textDecoration:'none',fontSize:'0.875rem'}}>Edit</Link>
                    <Link href={`/admin/schools/${school.id}/mentors`} style={{padding:'0.375rem 0.75rem',background:'#f3f4f6',color:'#374151',borderRadius:'6px',textDecoration:'none',fontSize:'0.875rem'}}>Mentors</Link>
                    <button onClick={() => deleteSchool(school.id, school.name)} disabled={deleting===school.id}
                      style={{padding:'0.375rem 0.75rem',background:deleting===school.id?'#d1d5db':'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',cursor:'pointer',fontSize:'0.875rem'}}>
                      {deleting===school.id?'...':'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {schools.length === 0 && <div style={{padding:'3rem',textAlign:'center',color:'#6b7280'}}>No schools yet.</div>}
      </div>
    </div>
  )
}
