import sql from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function ManagerDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "acsi_admin") redirect("/login")

  const profileRows = await sql`SELECT * FROM profiles WHERE id = ${params.id}`
  if (!profileRows[0]) redirect("/admin/users")
  const manager = profileRows[0] as any

  const schools = manager.region
    ? await sql`SELECT * FROM schools WHERE region = ${manager.region} ORDER BY name`
    : await sql`SELECT s.* FROM school_members sm JOIN schools s ON s.id = sm.school_id WHERE sm.user_id = ${params.id} ORDER BY s.name`

  const visits = await sql`
    SELECT mn.*, s.name as school_name, s.town, s.county
    FROM mentor_notes mn JOIN schools s ON s.id = mn.school_id
    WHERE mn.mentor_id = ${params.id} AND mn.is_private = false
    ORDER BY mn.visit_date DESC LIMIT 20
  `

  const stats = (await sql`
    SELECT COUNT(DISTINCT mn.id) as total_visits, COUNT(DISTINCT mn.school_id) as schools_visited,
           COUNT(DISTINCT a.id) as total_assessments, MAX(mn.visit_date) as last_visit
    FROM profiles p
    LEFT JOIN mentor_notes mn ON mn.mentor_id = p.id
    LEFT JOIN assessments a ON a.conducted_by = p.id
    WHERE p.id = ${params.id}
  `)[0] as any

  const NOTE_TYPE_LABELS: any = { visit: 'School Visit', phone_call: 'Phone Call', observation: 'Observation', other: 'Other' }

  return (
    <div style={{maxWidth:'1200px',margin:'0 auto',padding:'2rem'}}>
      <Link href="/admin/users" style={{color:'#3b82f6',textDecoration:'none',marginBottom:'2rem',display:'block'}}>← Back to Users</Link>

      <div style={{background:'white',borderRadius:'12px',padding:'2rem',border:'1px solid #e5e7eb',marginBottom:'2rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
          <div>
            <h1 style={{fontSize:'1.875rem',fontWeight:700,margin:'0 0 0.25rem 0'}}>{manager.full_name || manager.email}</h1>
            <div style={{color:'#6b7280',marginBottom:'0.5rem'}}>{manager.email}</div>
            <div style={{display:'flex',gap:'0.5rem'}}>
              <span style={{padding:'0.25rem 0.75rem',borderRadius:'999px',fontSize:'0.75rem',fontWeight:600,background:'#fef3c7',color:'#92400e'}}>{manager.role}</span>
              {manager.region && <span style={{padding:'0.25rem 0.75rem',borderRadius:'999px',fontSize:'0.75rem',fontWeight:600,background:'#eff6ff',color:'#1d4ed8'}}>{manager.region}</span>}
            </div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1rem',marginTop:'1.5rem'}}>
          {[['Total Visits', stats?.total_visits||0,'#3b82f6'],['Schools Visited', stats?.schools_visited||0,'#22c55e'],['Assessments', stats?.total_assessments||0,'#8b5cf6'],['Last Visit', stats?.last_visit ? new Date(stats.last_visit).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—','#f59e0b']].map(([label,value,color]:any) => (
            <div key={label} style={{textAlign:'center',background:'#f9fafb',borderRadius:'8px',padding:'1rem'}}>
              <div style={{fontSize:'1.5rem',fontWeight:700,color}}>{value}</div>
              <div style={{fontSize:'0.75rem',color:'#6b7280'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:700,margin:'0 0 1rem 0'}}>Schools ({schools.length})</h2>
          {schools.length === 0 ? <p style={{color:'#9ca3af'}}>No schools assigned.</p> : (
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {schools.map((s: any) => (
                <Link key={s.id} href={`/schools/${s.id}`} style={{display:'block',padding:'1rem',background:'white',borderRadius:'8px',border:'1px solid #e5e7eb',textDecoration:'none',color:'inherit'}}>
                  <div style={{fontWeight:600}}>{s.name}</div>
                  <div style={{fontSize:'0.875rem',color:'#6b7280'}}>{s.town}, {s.county}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 style={{fontSize:'1.25rem',fontWeight:700,margin:'0 0 1rem 0'}}>Recent Visits</h2>
          {visits.length === 0 ? <p style={{color:'#9ca3af'}}>No visits logged yet.</p> : (
            <div style={{display:'flex',flexDirection:'column',gap:'0.75rem'}}>
              {visits.map((v: any) => (
                <div key={v.id} style={{padding:'1rem',background:'white',borderRadius:'8px',border:'1px solid #e5e7eb'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.5rem'}}>
                    <Link href={`/schools/${v.school_id}/visits`} style={{fontWeight:600,color:'#1f2937',textDecoration:'none'}}>{v.school_name}</Link>
                    <span style={{fontSize:'0.8rem',color:'#9ca3af'}}>{v.visit_date ? new Date(v.visit_date).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '—'}</span>
                  </div>
                  <div style={{fontSize:'0.75rem',background:'#f3f4f6',color:'#6b7280',padding:'0.125rem 0.5rem',borderRadius:'9999px',display:'inline-block',marginBottom:'0.5rem'}}>{NOTE_TYPE_LABELS[v.note_type]||v.note_type}</div>
                  <p style={{margin:0,fontSize:'0.875rem',color:'#4b5563'}}>{v.content?.length > 120 ? v.content.substring(0,120)+'...' : v.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
