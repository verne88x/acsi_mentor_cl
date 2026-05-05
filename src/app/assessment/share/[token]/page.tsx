import sql from '@/lib/db'
import PublicAssessmentForm from '@/components/PublicAssessmentForm'

export default async function SharedAssessmentPage({ params }: { params: { token: string } }) {
  const rows = await sql`SELECT al.*, s.id as school_id, s.name, s.county, s.town FROM assessment_links al JOIN schools s ON s.id = al.school_id WHERE al.token = ${params.token}`
  if (!rows[0]) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',textAlign:'center'}}><h1>Link not found</h1></div>
  const link = rows[0] as any
  if (new Date(link.expires_at) < new Date()) return <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',textAlign:'center'}}><h1>Link expired</h1></div>
  return <PublicAssessmentForm school={{ id: link.school_id, name: link.name, county: link.county, town: link.town }} linkId={link.id} token={params.token} />
}
