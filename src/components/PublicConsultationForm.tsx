'use client'
import { useState, FormEvent } from 'react'

interface Props {
  school: { id: string; name: string; county: string; town: string }
  token: string
}

export default function PublicConsultationForm({ school, token }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    contact_person: '', contact_phone: '', contact_email: '',
    current_situation: '', specific_needs: '', goals: '', additional_info: ''
  })
  const update = (f: string, v: string) => setForm(prev => ({ ...prev, [f]: v }))
  const inp = { padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem', width: '100%', boxSizing: 'border-box' as const, fontFamily: 'inherit' }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      const res = await fetch('/api/consulting-requests/public', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ...form, school_id: school.id, token })
      })
      if (!res.ok) throw new Error('Failed')
      setSubmitted(true)
    } catch { alert('Failed to submit. Please try again.') } finally { setSaving(false) }
  }

  if (submitted) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',textAlign:'center',padding:'2rem'}}>
      <div style={{fontSize:'4rem',marginBottom:'1rem'}}>✅</div>
      <h1 style={{fontSize:'1.875rem',fontWeight:700,marginBottom:'0.5rem'}}>Request Submitted!</h1>
      <p style={{color:'#6b7280'}}>Thank you. Your coordinator will be in touch soon.</p>
    </div>
  )

  return (
    <div style={{maxWidth:'700px',margin:'0 auto',padding:'2rem'}}>
      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <h1 style={{fontSize:'1.875rem',fontWeight:700,margin:'0 0 0.5rem 0'}}>Consultation Request</h1>
        <p style={{color:'#6b7280',margin:0}}>{school.name} · {school.town}, {school.county}</p>
        <p style={{color:'#9ca3af',fontSize:'0.875rem',marginTop:'0.25rem'}}>Powered by ACSI School Mentor</p>
      </div>
      <div style={{background:'white',borderRadius:'12px',padding:'2rem',boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Contact Person *</label><input type="text" value={form.contact_person} onChange={e=>update('contact_person',e.target.value)} required style={inp} /></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem'}}>
            <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Phone</label><input type="tel" value={form.contact_phone} onChange={e=>update('contact_phone',e.target.value)} style={inp} /></div>
            <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Email</label><input type="email" value={form.contact_email} onChange={e=>update('contact_email',e.target.value)} style={inp} /></div>
          </div>
          <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Current Situation *</label><textarea value={form.current_situation} onChange={e=>update('current_situation',e.target.value)} required rows={3} placeholder="Describe the current situation at your school..." style={{...inp,resize:'vertical'}} /></div>
          <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Specific Needs *</label><textarea value={form.specific_needs} onChange={e=>update('specific_needs',e.target.value)} required rows={3} placeholder="What specific support are you looking for?" style={{...inp,resize:'vertical'}} /></div>
          <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Goals</label><textarea value={form.goals} onChange={e=>update('goals',e.target.value)} rows={2} placeholder="What outcomes are you hoping for?" style={{...inp,resize:'vertical'}} /></div>
          <div><label style={{display:'block',marginBottom:'0.5rem',fontWeight:500}}>Additional Information</label><textarea value={form.additional_info} onChange={e=>update('additional_info',e.target.value)} rows={2} style={{...inp,resize:'vertical'}} /></div>
          <button type="submit" disabled={saving} style={{padding:'0.875rem',background:saving?'#d1d5db':'#667eea',color:'white',border:'none',borderRadius:'8px',fontWeight:600,fontSize:'1rem',cursor:saving?'not-allowed':'pointer'}}>
            {saving ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
