'use client'
import { useState } from 'react'

export default function ShareConsultationButton({ schoolId }: { schoolId: string }) {
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function generateLink() {
    setLoading(true)
    try {
      const res = await fetch(`/api/schools/${schoolId}/consultation-link`, { method: 'POST' })
      const data = await res.json()
      setLink(data.link)
    } catch { alert('Failed to generate link') } finally { setLoading(false) }
  }

  async function copyLink() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      {!link ? (
        <button onClick={generateLink} disabled={loading}
          style={{width:'100%',padding:'1rem',background:'white',border:'1px solid #e5e7eb',borderRadius:'8px',textAlign:'left',cursor:'pointer',fontSize:'1rem'}}>
          {loading ? 'Generating...' : '📋 Share Consultation Form'}
        </button>
      ) : (
        <div style={{display:'flex',gap:'0.5rem',alignItems:'center'}}>
          <input type="text" value={link} readOnly
            style={{flex:1,padding:'0.75rem',border:'1px solid #d1d5db',borderRadius:'8px',fontSize:'0.875rem',background:'#f9fafb'}} />
          <button onClick={copyLink}
            style={{padding:'0.75rem 1rem',background:copied?'#22c55e':'#667eea',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600,whiteSpace:'nowrap'}}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
