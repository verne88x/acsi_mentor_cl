import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { ActionPlan, ActionItem, School } from '@/types'

export async function generateActionPlanPDF(
  plan: ActionPlan & {
    school: School
    action_items: ActionItem[]
  }
) {
  const pdfDoc = await PDFDocument.create()
  
  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors
  const primary = rgb(0.23, 0.51, 0.98) // #3b82f6
  const textDark = rgb(0.07, 0.09, 0.15) // #111827
  const textGray = rgb(0.42, 0.45, 0.50) // #6b7280
  const success = rgb(0.13, 0.77, 0.37) // #22c55e
  const warning = rgb(0.92, 0.70, 0.03) // #eab308
  const danger = rgb(0.93, 0.27, 0.27) // #ef4444

  // Group items by domain
  const itemsByDomain = plan.action_items.reduce((acc, item) => {
    if (!acc[item.domain]) {
      acc[item.domain] = []
    }
    acc[item.domain].push(item)
    return acc
  }, {} as Record<string, ActionItem[]>)

  // Helper function to add new page
  const addPage = () => {
    const page = pdfDoc.addPage([595, 842]) // A4
    return { page, yPosition: 842 - 60 }
  }

  let { page, yPosition } = addPage()
  const { width } = page.getSize()
  const margin = 50
  const contentWidth = width - (margin * 2)

  // === PAGE 1: HEADER & SUMMARY ===

  // Header
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

  page.drawText('Action Plan', {
    x: margin,
    y: yPosition - 32,
    size: 12,
    font: regularFont,
    color: rgb(1, 1, 1),
  })

  yPosition -= 100

  // School & Plan Info
  page.drawText(plan.school.name, {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: textDark,
  })
  yPosition -= 25

  page.drawText(plan.title, {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: textGray,
  })
  yPosition -= 20

  if (plan.description) {
    page.drawText(plan.description, {
      x: margin,
      y: yPosition,
      size: 10,
      font: regularFont,
      color: textGray,
      maxWidth: contentWidth,
    })
    yPosition -= 25
  }

  // Dates
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString()
  
  page.drawText(`Created: ${formatDate(plan.created_at)}`, {
    x: margin,
    y: yPosition,
    size: 9,
    font: regularFont,
    color: textGray,
  })

  if (plan.start_date) {
    page.drawText(`Start: ${formatDate(plan.start_date)}`, {
      x: margin + 150,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: textGray,
    })
  }

  if (plan.end_date) {
    page.drawText(`End: ${formatDate(plan.end_date)}`, {
      x: margin + 280,
      y: yPosition,
      size: 9,
      font: regularFont,
      color: textGray,
    })
  }

  yPosition -= 30

  // Progress Summary Box
  const summaryBoxHeight = 80
  page.drawRectangle({
    x: margin,
    y: yPosition - summaryBoxHeight,
    width: contentWidth,
    height: summaryBoxHeight,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.88, 0.90, 0.92),
    borderWidth: 1,
  })

  page.drawText('Progress Summary', {
    x: margin + 15,
    y: yPosition - 20,
    size: 12,
    font: boldFont,
    color: textDark,
  })

  const total = plan.action_items.length
  const completed = plan.action_items.filter(i => i.status === 'completed').length
  const inProgress = plan.action_items.filter(i => i.status === 'in_progress').length
  const pending = plan.action_items.filter(i => i.status === 'pending').length

  const statsY = yPosition - 50
  const statSpacing = contentWidth / 4

  // Total
  page.drawText(`${total}`, {
    x: margin + 15,
    y: statsY,
    size: 20,
    font: boldFont,
    color: textDark,
  })
  page.drawText('Total Items', {
    x: margin + 15,
    y: statsY - 15,
    size: 8,
    font: regularFont,
    color: textGray,
  })

  // Completed
  page.drawText(`${completed}`, {
    x: margin + 15 + statSpacing,
    y: statsY,
    size: 20,
    font: boldFont,
    color: success,
  })
  page.drawText('Completed', {
    x: margin + 15 + statSpacing,
    y: statsY - 15,
    size: 8,
    font: regularFont,
    color: textGray,
  })

  // In Progress
  page.drawText(`${inProgress}`, {
    x: margin + 15 + statSpacing * 2,
    y: statsY,
    size: 20,
    font: boldFont,
    color: warning,
  })
  page.drawText('In Progress', {
    x: margin + 15 + statSpacing * 2,
    y: statsY - 15,
    size: 8,
    font: regularFont,
    color: textGray,
  })

  // Pending
  page.drawText(`${pending}`, {
    x: margin + 15 + statSpacing * 3,
    y: statsY,
    size: 20,
    font: boldFont,
    color: textGray,
  })
  page.drawText('Pending', {
    x: margin + 15 + statSpacing * 3,
    y: statsY - 15,
    size: 8,
    font: regularFont,
    color: textGray,
  })

  yPosition -= summaryBoxHeight + 30

  // === ACTION ITEMS BY DOMAIN ===

  page.drawText('Action Items', {
    x: margin,
    y: yPosition,
    size: 14,
    font: boldFont,
    color: textDark,
  })
  yPosition -= 25

  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const testWidth = testLine.length * fontSize * 0.5 // Rough estimate
      
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

  // Iterate through domains
  for (const [domain, items] of Object.entries(itemsByDomain)) {
    // Check if we need a new page for domain header
    if (yPosition < 100) {
      const newPageData = addPage()
      page = newPageData.page
      yPosition = newPageData.yPosition
    }

    // Domain Header
    page.drawRectangle({
      x: margin,
      y: yPosition - 25,
      width: contentWidth,
      height: 25,
      color: rgb(0.96, 0.97, 0.98),
    })

    page.drawText(domain.replace(/_/g, ' '), {
      x: margin + 10,
      y: yPosition - 18,
      size: 11,
      font: boldFont,
      color: textDark,
    })

    yPosition -= 35

    // Items
    for (const item of items) {
      // Check if we need a new page
      if (yPosition < 120) {
        const newPageData = addPage()
        page = newPageData.page
        yPosition = newPageData.yPosition
      }

      // Status badge color
      let statusColor = textGray
      if (item.status === 'completed') statusColor = success
      if (item.status === 'in_progress') statusColor = warning
      if (item.status === 'blocked') statusColor = danger

      // Status
      page.drawText(`[${item.status.toUpperCase()}]`, {
        x: margin,
        y: yPosition,
        size: 8,
        font: boldFont,
        color: statusColor,
      })

      // Priority
      const priority = item.priority === 1 ? 'HIGH' : item.priority === 2 ? 'MED' : 'LOW'
      const priorityColor = item.priority === 1 ? danger : item.priority === 2 ? warning : textGray
      
      page.drawText(`[${priority}]`, {
        x: margin + 80,
        y: yPosition,
        size: 8,
        font: boldFont,
        color: priorityColor,
      })

      yPosition -= 15

      // Description (wrapped)
      const descLines = wrapText(item.description, contentWidth - 20, 9)
      for (const line of descLines) {
        page.drawText(line, {
          x: margin + 10,
          y: yPosition,
          size: 9,
          font: regularFont,
          color: textDark,
          maxWidth: contentWidth - 20,
        })
        yPosition -= 12
      }

      yPosition -= 3

      // Owner & KPI
      if (item.owner_name) {
        page.drawText(`Owner: ${item.owner_name}`, {
          x: margin + 10,
          y: yPosition,
          size: 8,
          font: regularFont,
          color: textGray,
        })
        yPosition -= 12
      }

      if (item.kpi) {
        const kpiLines = wrapText(`KPI: ${item.kpi}`, contentWidth - 20, 8)
        for (const line of kpiLines) {
          page.drawText(line, {
            x: margin + 10,
            y: yPosition,
            size: 8,
            font: regularFont,
            color: textGray,
            maxWidth: contentWidth - 20,
          })
          yPosition -= 11
        }
      }

      if (item.due_date) {
        page.drawText(`Due: ${formatDate(item.due_date)}`, {
          x: margin + 10,
          y: yPosition,
          size: 8,
          font: regularFont,
          color: textGray,
        })
        yPosition -= 12
      }

      // Separator line
      page.drawLine({
        start: { x: margin, y: yPosition - 5 },
        end: { x: width - margin, y: yPosition - 5 },
        thickness: 0.5,
        color: rgb(0.90, 0.91, 0.93),
      })

      yPosition -= 15
    }

    yPosition -= 10
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
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${plan.school.name.replace(/\s+/g, '_')}_Action_Plan_${new Date().toISOString().split('T')[0]}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
