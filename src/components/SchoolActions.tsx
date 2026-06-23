'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SchoolActions({ schoolId }: { schoolId: string }) {
  const router = useRouter()
  const [assessmentLink, setAssessmentLink] = useState<string | null>(null)
  const [consultationLink, setConsultationLink] = useState<string | null>(null)
  const [loadingA, setLoadingA] = useState(false)
  const [loadingC, setLoadingC] = useState(false)

  async function getAssessmentLink() {
    setLoadingA(true)
    try {
      const res = await fetch(`/api/schools/${schoolId}/assessment-link`, { method: 'POST' })
      const data = await res.json()
      setAssessmentLink(data.link)
      shareLink(data.link, 'Health Check Assessment')
    } catch { alert('Failed') } finally { setLoadingA(false) }
  }

  async function getConsultationLink() {
    setLoadingC(true)
    try {
      const res = await fetch(`/api/schools/${schoolId}/consultation-link`, { method: 'POST' })
      const data = await res.json()
      setConsultationLink(data.link)
      shareLink(data.link, 'Consultation Form')
    } catch { alert('Failed') } finally { setLoadingC(false) }
  }

  async function shareLink(link: string, title: string) {
    if (navigator.share) {
      try {
        await navigator.share({ title: `ACSI ${title}`, url: link })
        return
      } catch {}
    }
    await navigator.clipboard.writeText(link)
    alert('Link copied to clipboard!')
  }

  const btnStyle = {
    width: '100%', padding: '1rem 1.25rem', background: 'white',
    border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
    fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  }

  const primaryStyle = {
    width: '100%', padding: '1rem 1.25rem', background: '#667eea', color: 'white',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{display:'flex',gap:'0.5rem',alignItems:'stretch'}}>
        <button onClick={() => router.push(`/schools/${schoolId}/assessment`)} style={{...primaryStyle, flex:1}}>
          <span>New Health Check Assessment</span><span>→</span>
        </button>
        <button onClick={getAssessmentLink} disabled={loadingA} title="Share Assessment Link"
          style={{padding:'1rem',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'8px',cursor:'pointer',fontSize:'1.25rem'}}>
          {loadingA ? '...' : '🔗'}
        </button>
      </div>

      <div style={{display:'flex',gap:'0.5rem',alignItems:'stretch'}}>
        <button onClick={() => router.push(`/schools/${schoolId}/consulting-request`)} style={{...btnStyle, flex:1}}>
          <span>Consultation Form</span><span style={{color:'#9ca3af'}}>→</span>
        </button>
        <button onClick={getConsultationLink} disabled={loadingC} title="Share Consultation Link"
          style={{padding:'1rem',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',cursor:'pointer',fontSize:'1.25rem'}}>
          {loadingC ? '...' : '📤'}
        </button>
      </div>
    </div>
  )
}
