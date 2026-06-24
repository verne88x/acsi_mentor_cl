'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SchoolActions({ schoolId }: { schoolId: string }) {
  const router = useRouter()
  const [loadingA, setLoadingA] = useState(false)
  const [loadingC, setLoadingC] = useState(false)
  const [copiedA, setCopiedA] = useState(false)
  const [copiedC, setCopiedC] = useState(false)

  async function getAndCopyLink(type: 'assessment' | 'consultation') {
    if (type === 'assessment') setLoadingA(true)
    else setLoadingC(true)
    try {
      const endpoint = type === 'assessment' 
        ? '/api/schools/' + schoolId + '/assessment-link'
        : '/api/schools/' + schoolId + '/consultation-link'
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      await navigator.clipboard.writeText(data.link)
      if (type === 'assessment') { setCopiedA(true); setTimeout(() => setCopiedA(false), 2000) }
      else { setCopiedC(true); setTimeout(() => setCopiedC(false), 2000) }
    } catch { alert('Failed to generate link') } finally {
      if (type === 'assessment') setLoadingA(false)
      else setLoadingC(false)
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
      <div style={{display:'flex',gap:'0.5rem',alignItems:'stretch'}}>
        <button onClick={() => router.push('/schools/' + schoolId + '/assessment')}
          style={{flex:1,padding:'1rem 1.25rem',background:'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center',fontWeight:600}}>
          <span>New Health Check Assessment</span><span>→</span>
        </button>
        <button onClick={() => getAndCopyLink('assessment')} disabled={loadingA} title="Copy Assessment Link"
          style={{padding:'1rem 1.25rem',background:copiedA?'#22c55e':'#eff6ff',border:'1px solid #bfdbfe',borderRadius:'8px',cursor:'pointer',fontSize:'0.875rem',fontWeight:600,color:copiedA?'white':'#3b82f6',whiteSpace:'nowrap'}}>
          {loadingA ? '...' : copiedA ? '✓ Copied' : '🔗 Copy Link'}
        </button>
      </div>

      <div style={{display:'flex',gap:'0.5rem',alignItems:'stretch'}}>
        <button onClick={() => router.push('/schools/' + schoolId + '/consulting-request')}
          style={{flex:1,padding:'1rem 1.25rem',background:'white',border:'1px solid #e5e7eb',borderRadius:'8px',cursor:'pointer',fontSize:'1rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>Consultation Form</span><span style={{color:'#9ca3af'}}>→</span>
        </button>
        <button onClick={() => getAndCopyLink('consultation')} disabled={loadingC} title="Copy Consultation Link"
          style={{padding:'1rem 1.25rem',background:copiedC?'#22c55e':'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'8px',cursor:'pointer',fontSize:'0.875rem',fontWeight:600,color:copiedC?'white':'#16a34a',whiteSpace:'nowrap'}}>
          {loadingC ? '...' : copiedC ? '✓ Copied' : '📤 Copy Link'}
        </button>
      </div>
    </div>
  )
}
