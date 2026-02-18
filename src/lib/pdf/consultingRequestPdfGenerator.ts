import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ConsultingRequestWithDetails } from '@/types'

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  'pre-primary': 'Pre-Primary (PP1–PP2)',
  'primary': 'Primary School (Grade 1–6)',
  'junior-secondary': 'Junior Secondary School (Grade 7–9)',
  'senior-secondary': 'Senior Secondary School (Grade 10–12)',
  'other': 'Other',
}

export async function generateConsultingRequestPDF(
  request: ConsultingRequestWithDetails
) {
  const pdfDoc = await PDFDocument.create()
  
  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors
  const primary = rgb(0.23, 0.51, 0.98) // #3b82f6
  const textDark = rgb(0.07, 0.09, 0.15) // #111827
  const textGray = rgb(0.42, 0.45, 0.50) // #6b7280

  // Helper function to add new page
  const addPage = () => {
    const page = pdfDoc.addPage([595, 842]) // A4
    return { page, yPosition: 842 - 60 }
  }

  let { page, yPosition } = addPage()
  const { width } = page.getSize()
  const margin = 50
  const contentWidth = width - (margin * 2)

  // === HEADER ===
  page.drawRectangle({
    x: 0,
    y: yPosition - 40,
    width,
    height: 80,
    color: primary,
  })

  page.drawText('ACSI SCHOOL MENTOR', {
    x: margin,
    y: yPosition - 10,
    size: 20,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText('Consultation Form', {
    x: margin,
    y: yPosition - 32,
    size: 12,
    font: regularFont,
    color: rgb(1, 1, 1),
  })

  yPosition -= 100

  // School Name
  page.drawText(request.school.name, {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: textDark,
  })
  yPosition -= 25

  // Location
  const location = `${request.school.town || ''}, ${request.school.county || ''}`.trim().replace(/^,\s*/, '')
  if (location) {
    page.drawText(location, {
      x: margin,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: textGray,
    })
    yPosition -= 20
  }

  // Submitted date
  page.drawText(`Submitted: ${new Date(request.created_at).toLocaleDateString()}`, {
    x: margin,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: textGray,
  })
  yPosition -= 30

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const testWidth = regularFont.widthOfTextAtSize(testLine, 9)
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        currentLine = testLine
      }
    }
    
    if (currentLine) lines.push(currentLine)
    return lines
  }

  // Helper to check if new page needed
  const checkNewPage = (neededSpace: number) => {
    if (yPosition < neededSpace + 80) {
      const newPageData = addPage()
      page = newPageData.page
      yPosition = newPageData.yPosition
      return true
    }
    return false
  }

  // === SECTION 1: CONTACT INFORMATION ===
  checkNewPage(80)
  
  page.drawText('1. Contact Information', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: textDark,
  })
  yPosition -= 20

  const contactFields = [
    { label: 'Contact Person', value: request.contact_person },
    { label: 'Role/Title', value: request.contact_role },
    { label: 'Email', value: request.contact_email },
    { label: 'Phone', value: request.contact_phone },
  ]

  for (const field of contactFields) {
    if (field.value) {
      page.drawText(field.label + ':', {
        x: margin,
        y: yPosition,
        size: 9,
        font: boldFont,
        color: textGray,
      })
      yPosition -= 14

      page.drawText(field.value, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 18
    }
  }

  yPosition -= 10

  // === SECTION 2: SCHOOL PROFILE ===
  checkNewPage(100)

  page.drawText('2. School Profile', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: textDark,
  })
  yPosition -= 20

  const profileFields = [
    { label: 'Year Established', value: request.year_established?.toString() },
    { label: 'Total Students', value: request.total_students?.toString() },
    { label: 'Number of Teachers', value: request.number_teachers?.toString() },
    { label: 'Affiliation', value: request.affiliation },
  ]

  for (const field of profileFields) {
    if (field.value) {
      page.drawText(field.label + ':', {
        x: margin,
        y: yPosition,
        size: 9,
        font: boldFont,
        color: textGray,
      })
      yPosition -= 14

      page.drawText(field.value, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 18
    }
  }

  // School Types
  if (request.school_types && request.school_types.length > 0) {
    page.drawText('School Type:', {
      x: margin,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: textGray,
    })
    yPosition -= 14

    const typesText = request.school_types.map(t => SCHOOL_TYPE_LABELS[t] || t).join(', ')
    const finalTypesText = request.school_type_other ? `${typesText} (${request.school_type_other})` : typesText
    
    const typeLines = wrapText(finalTypesText, contentWidth - 20)
    for (const line of typeLines) {
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 12
    }
    yPosition -= 6
  }

  yPosition -= 10

  // === SECTION 3: CURRENT SITUATION ===
  if (request.current_status) {
    checkNewPage(100)

    page.drawText('3. Current Situation', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textDark,
    })
    yPosition -= 20

    const statusLines = wrapText(request.current_status, contentWidth - 20)
    for (const line of statusLines) {
      checkNewPage(20)
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 12
    }
    yPosition -= 18
  }

  // === SECTION 4: CONSULTING NEEDS ===
  checkNewPage(120)

  page.drawText('4. Consulting Needs Assessment (1-5)', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: textDark,
  })
  yPosition -= 20

  const needs = [
    { label: 'Strategic Planning', value: request.strategic_planning },
    { label: 'Organizational Development', value: request.organizational_dev },
    { label: 'Teacher & Staff Training', value: request.teacher_training },
    { label: 'Fundraising & Partnerships', value: request.fundraising },
    { label: 'Values Integration', value: request.values_integration },
    { label: 'Communication & Marketing', value: request.communication_marketing },
  ]

  for (const need of needs) {
    if (need.value) {
      checkNewPage(25)
      
      page.drawText(need.label + ':', {
        x: margin,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })

      page.drawText(`${need.value}/5`, {
        x: width - margin - 30,
        y: yPosition,
        size: 9,
        font: boldFont,
        color: primary,
      })
      
      yPosition -= 18
    }
  }

  if (request.other_need && request.other_rating) {
    checkNewPage(25)
    
    page.drawText(request.other_need + ':', {
      x: margin,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: textDark,
    })

    page.drawText(`${request.other_rating}/5`, {
      x: width - margin - 30,
      y: yPosition,
      size: 9,
      font: boldFont,
      color: primary,
    })
    
    yPosition -= 18
  }

  yPosition -= 10

  // === SECTION 5: KEY CHALLENGES ===
  if (request.key_challenges) {
    checkNewPage(100)

    page.drawText('5. Key Challenges', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textDark,
    })
    yPosition -= 20

    const challengeLines = wrapText(request.key_challenges, contentWidth - 20)
    for (const line of challengeLines) {
      checkNewPage(20)
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 12
    }
    yPosition -= 18
  }

  // === SECTION 6: DESIRED OUTCOMES ===
  if (request.desired_outcomes) {
    checkNewPage(100)

    page.drawText('6. Desired Outcomes', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textDark,
    })
    yPosition -= 20

    const outcomeLines = wrapText(request.desired_outcomes, contentWidth - 20)
    for (const line of outcomeLines) {
      checkNewPage(20)
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 12
    }
    yPosition -= 18
  }

  // === SECTION 7: TIMELINE ===
  if (request.timeline) {
    checkNewPage(60)

    page.drawText('7. Timeline & Availability', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textDark,
    })
    yPosition -= 20

    page.drawText(request.timeline, {
      x: margin + 10,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: textDark,
    })
    yPosition -= 28
  }

  // === SECTION 8: ADDITIONAL COMMENTS ===
  if (request.additional_comments) {
    checkNewPage(100)

    page.drawText('8. Additional Comments', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: textDark,
    })
    yPosition -= 20

    const commentLines = wrapText(request.additional_comments, contentWidth - 20)
    for (const line of commentLines) {
      checkNewPage(20)
      page.drawText(line, {
        x: margin + 10,
        y: yPosition,
        size: 9,
        font: regularFont,
        color: textDark,
      })
      yPosition -= 12
    }
  }

  // Footer on last page
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
  lastPage.drawText(`Generated by ACSI School Mentor - ${new Date().toLocaleDateString()}`, {
    x: margin,
    y: 30,
    size: 8,
    font: regularFont,
    color: textGray,
  })

  // Save and download
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${request.school.name.replace(/\s+/g, '_')}_Consultation_Form_${new Date().toISOString().split('T')[0]}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
