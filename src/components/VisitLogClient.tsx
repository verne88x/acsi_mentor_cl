'use client'
import { useState } from "react"

interface Note {
  id: string
  visit_date: string
  note_type: string
  content: string
  is_private: boolean
  mentor_name: string
  created_at: string
}

interface Props {
  school: any
  initialNotes: Note[]
  userId: string
}

const NOTE_TYPES = [
  { value: "visit", label: "School Visit" },
  { value: "phone_call", label: "Phone Call" },
  { value: "observation", label: "Observation" },
  { value: "other", label: "Other" },
]

const TYPE_ICONS: Record<string, string> = {
  visit: "🏫",
  phone_call: "📞",
  observation: "👁",
  other: "📝",
}

export default function VisitLogClient({ school, initialNotes, userId }: Props) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [form, setForm] = useState({
    visit_date: new Date().toISOString().split("T")[0],
    note_type: "visit",
    content: "",
    is_private: false,
  })

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }))

  async function handleSave() {
    if (!form.content.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`/api/schools/${school.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed")
      const note = await res.json()
      setNotes(prev => [{ ...note, mentor_name: "You" }, ...prev])
      setForm({ visit_date: new Date().toISOString().split("T")[0], note_type: "visit", content: "", is_private: false })
      setShowForm(false)
    } catch (e) {
      alert("Failed to save note. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Delete this note?")) return
    await fetch(`/api/schools/${school.id}/notes/${noteId}`, { method: "DELETE" })
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  async function handleExportPDF() {
    setExporting(true)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib")
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      const addPage = () => {
        const page = pdfDoc.addPage([595, 842])
        return { page, y: 800 }
      }

      let { page, y } = addPage()
      const margin = 50
      const width = 595 - margin * 2

      // Header
      page.drawText("ACSI SCHOOL MENTOR", { x: margin, y, font: boldFont, size: 10, color: rgb(0.4, 0.47, 0.91) })
      y -= 20
      page.drawText("Visit Log Report", { x: margin, y, font: boldFont, size: 18, color: rgb(0.1, 0.1, 0.1) })
      y -= 20
      page.drawText(school.name, { x: margin, y, font, size: 13, color: rgb(0.4, 0.4, 0.4) })
      y -= 10
      page.drawText(`Generated: ${new Date().toLocaleDateString()}  ·  Total visits: ${notes.length}`, { x: margin, y, font, size: 10, color: rgb(0.6, 0.6, 0.6) })
      y -= 15
      page.drawLine({ start: { x: margin, y }, end: { x: 595 - margin, y }, thickness: 1, color: rgb(0.8, 0.8, 0.8) })
      y -= 20

      for (const note of notes) {
        if (y < 150) {
          const next = addPage()
          page = next.page
          y = next.y
        }

        const typeLabel = NOTE_TYPES.find(t => t.value === note.note_type)?.label || note.note_type
        const dateStr = note.visit_date ? new Date(note.visit_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "No date"

        // Note header
        page.drawRectangle({ x: margin, y: y - 22, width, height: 26, color: rgb(0.97, 0.97, 1) })
        page.drawText(`${dateStr}  ·  ${typeLabel}`, { x: margin + 8, y: y - 14, font: boldFont, size: 11, color: rgb(0.1, 0.1, 0.4) })
        page.drawText(`by ${note.mentor_name}`, { x: 595 - margin - 100, y: y - 14, font, size: 9, color: rgb(0.5, 0.5, 0.5) })
        y -= 32

        // Content - word wrap
        const words = note.content.split(" ")
        let line = ""
        for (const word of words) {
          const test = line ? `${line} ${word}` : word
          const testWidth = font.widthOfTextAtSize(test, 10)
          if (testWidth > width - 16 && line) {
            if (y < 80) { const next = addPage(); page = next.page; y = next.y }
            page.drawText(line, { x: margin + 8, y, font, size: 10, color: rgb(0.2, 0.2, 0.2) })
            y -= 15
            line = word
          } else {
            line = test
          }
        }
        if (line) {
          if (y < 80) { const next = addPage(); page = next.page; y = next.y }
          page.drawText(line, { x: margin + 8, y, font, size: 10, color: rgb(0.2, 0.2, 0.2) })
          y -= 15
        }

        y -= 15
        if (y > 80) {
          page.drawLine({ start: { x: margin, y }, end: { x: 595 - margin, y }, thickness: 0.5, color: rgb(0.9, 0.9, 0.9) })
          y -= 15
        }
      }

      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${school.name.replace(/\s+/g, "_")}_Visit_Log_${new Date().toISOString().split("T")[0]}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert("Failed to generate PDF")
    } finally {
      setExporting(false)
    }
  }

  const inp = { padding: "0.75rem", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "1rem", width: "100%", boxSizing: "border-box" as const, fontFamily: "inherit" }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>Visit Log</h1>
          <p style={{ color: "#6b7280", margin: "0.25rem 0 0 0" }}>{school.name}</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {notes.length > 0 && (
            <button onClick={handleExportPDF} disabled={exporting}
              style={{ padding: "0.75rem 1.25rem", background: "white", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
              {exporting ? "Exporting..." : "📄 Export PDF"}
            </button>
          )}
          <button onClick={() => setShowForm(!showForm)}
            style={{ padding: "0.75rem 1.5rem", background: "#667eea", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Log Visit"}
          </button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e5e7eb", marginBottom: "1.5rem", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.125rem", fontWeight: 600 }}>New Visit Entry</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Date *</label>
              <input type="date" value={form.visit_date} onChange={e => update("visit_date", e.target.value)} style={inp} />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Type *</label>
              <select value={form.note_type} onChange={e => update("note_type", e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                {NOTE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500, fontSize: "0.875rem" }}>Notes *</label>
            <textarea value={form.content} onChange={e => update("content", e.target.value)} rows={5} placeholder="What was observed? What was discussed? What follow-up is needed?"
              style={{ ...inp, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "#6b7280" }}>
              <input type="checkbox" checked={form.is_private} onChange={e => update("is_private", e.target.checked)} />
              Private (only visible to me)
            </label>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "0.625rem 1.25rem", background: "white", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.content.trim()}
                style={{ padding: "0.625rem 1.5rem", background: saving || !form.content.trim() ? "#d1d5db" : "#667eea", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: saving || !form.content.trim() ? "not-allowed" : "pointer" }}>
                {saving ? "Saving..." : "Save Entry"}
              </button>
            </div>
          </div>
        </div>
      )}

      {notes.length === 0 && !showForm ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ margin: "0 0 0.5rem 0", color: "#374151" }}>No visits logged yet</h3>
          <p style={{ margin: "0 0 1.5rem 0" }}>Start by logging your first visit to {school.name}</p>
          <button onClick={() => setShowForm(true)} style={{ padding: "0.75rem 1.5rem", background: "#667eea", color: "white", border: "none", borderRadius: "8px", fontWeight: 600, cursor: "pointer" }}>
            + Log First Visit
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notes.map(note => (
            <div key={note.id} style={{ background: "white", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.5rem" }}>{TYPE_ICONS[note.note_type] || "📝"}</span>
                  <div>
                    <div style={{ fontWeight: 600, color: "#1f2937" }}>
                      {NOTE_TYPES.find(t => t.value === note.note_type)?.label || note.note_type}
                      {note.is_private && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", background: "#f3f4f6", color: "#6b7280", padding: "0.125rem 0.5rem", borderRadius: "9999px" }}>Private</span>}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {note.visit_date ? new Date(note.visit_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "No date"}
                      {" · "}by {note.mentor_name}
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(note.id)}
                  style={{ padding: "0.375rem 0.75rem", background: "white", color: "#ef4444", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem" }}>
                  Delete
                </button>
              </div>
              <p style={{ margin: 0, color: "#374151", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
