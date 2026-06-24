import sql from "@/lib/db"
import PublicConsultationForm from "@/components/PublicConsultationForm"

export default async function SharedConsultationPage({ params }: { params: { token: string } }) {
  const rows = await sql`
    SELECT cl.*, s.id as school_id, s.name, s.county, s.town
    FROM consultation_links cl
    JOIN schools s ON s.id = cl.school_id
    WHERE cl.token = ${params.token}
  `

  if (!rows[0]) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',textAlign:'center',padding:'2rem'}}>
      <div style={{fontSize:'3rem',marginBottom:'1rem'}}>❌</div>
      <h1>Link not found</h1>
      <p style={{color:'#6b7280'}}>This consultation link is invalid or has expired.</p>
    </div>
  )

  const link = rows[0] as any
  return <PublicConsultationForm school={{ id: link.school_id, name: link.name, county: link.county, town: link.town }} token={params.token} />
}
