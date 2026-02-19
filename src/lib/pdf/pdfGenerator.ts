import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib'
import { Assessment, School } from '@/types'
import { HEALTH_CHECK_DOMAINS, getScoreLabel } from '@/lib/config/healthCheckConfig'

interface DomainScore {
  domain: typeof HEALTH_CHECK_DOMAINS[0]
  score: number
}

const getScoreColorRGB = (score: number) => {
  if (score >= 4) return rgb(0.13, 0.77, 0.37)
  if (score >= 3) return rgb(0.92, 0.70, 0.03)
  if (score >= 2) return rgb(0.97, 0.51, 0.19)
  return rgb(0.93, 0.27, 0.27)
}

const getScoreDescription = (score: number): string => {
  if (score >= 4) return 'Exemplary - Outstanding implementation with consistent innovation and best practices.'
  if (score >= 3) return 'Proficient - Solid implementation meeting all essential expectations and standards.'
  if (score >= 2) return 'Developing - Partial implementation present, requiring focused strengthening efforts.'
  return 'Not Evident - Minimal or no implementation observed, immediate attention required.'
}

export async function generateAssessmentPDF(
  assessment: Assessment,
  school: School,
  domainScores: DomainScore[]
) {
  const pdfDoc = await PDFDocument.create()
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  const primary = rgb(0.23, 0.51, 0.98)
  const textDark = rgb(0.07, 0.09, 0.15)
  const textGray = rgb(0.42, 0.45, 0.50)
  const lightGray = rgb(0.96, 0.97, 0.98)
  
  const margin = 50
  const pageWidth = 595
  const pageHeight = 842
  const contentWidth = pageWidth - (margin * 2)
  
  const addPage = () => {
    const page = pdfDoc.addPage([pageWidth, pageHeight])
    return { page, yPosition: pageHeight - 60 }
  }
  
  const drawSectionHeader = (page: PDFPage, y: number, title: string) => {
    page.drawRectangle({ x: margin, y: y - 30, width: contentWidth, height: 30, color: lightGray })
    page.drawText(title, { x: margin + 15, y: y - 20, size: 14, font: boldFont, color: textDark })
    return y - 45
  }
  
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    const words = text.split(' ')
    const lines: string[] = []
    let currentLine = ''
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word
      const testWidth = regularFont.widthOfTextAtSize(testLine, fontSize)
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
  
  const sortedDomains = [...domainScores].sort((a, b) => a.score - b.score)
  const overallScore = assessment.overall_score || 0
  
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  let { page, yPosition } = addPage()
  
  page.drawRectangle({ x: 0, y: pageHeight - 150, width: pageWidth, height: 150, color: primary })
  page.drawText('ACSI KENYA', { x: margin, y: pageHeight - 50, size: 28, font: boldFont, color: rgb(1, 1, 1) })
  page.drawText('PSI Health Check Assessment Report', { x: margin, y: pageHeight - 80, size: 16, font: regularFont, color: rgb(1, 1, 1) })
  page.drawText(new Date(assessment.assessment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), { x: margin, y: pageHeight - 105, size: 12, font: regularFont, color: rgb(0.9, 0.9, 0.9) })
  
  yPosition = pageHeight - 200
  page.drawRectangle({ x: margin, y: yPosition - 80, width: contentWidth, height: 80, color: lightGray, borderColor: rgb(0.85, 0.87, 0.89), borderWidth: 1 })
  page.drawText(school.name, { x: margin + 20, y: yPosition - 30, size: 20, font: boldFont, color: textDark })
  page.drawText(`${school.town || ''}, ${school.county || ''}`.trim().replace(/^,\s*/, ''), { x: margin + 20, y: yPosition - 50, size: 11, font: regularFont, color: textGray })
  
  yPosition -= 120
  yPosition = drawSectionHeader(page, yPosition, '1. Executive Summary')
  
  page.drawRectangle({ x: margin + 20, y: yPosition - 80, width: 150, height: 80, color: rgb(0.98, 0.98, 0.99), borderColor: getScoreColorRGB(overallScore), borderWidth: 3 })
  page.drawText('Overall Score', { x: margin + 45, y: yPosition - 25, size: 10, font: regularFont, color: textGray })
  page.drawText(overallScore.toFixed(1), { x: margin + 65, y: yPosition - 50, size: 32, font: boldFont, color: getScoreColorRGB(overallScore) })
  page.drawText(getScoreLabel(Math.round(overallScore)), { x: margin + 35, y: yPosition - 70, size: 9, font: boldFont, color: getScoreColorRGB(overallScore) })
  
  const summaryLines = wrapText(getScoreDescription(overallScore), contentWidth - 200, 10)
  let summaryY = yPosition - 25
  for (const line of summaryLines) {
    page.drawText(line, { x: margin + 200, y: summaryY, size: 10, font: regularFont, color: textDark })
    summaryY -= 14
  }
  
  yPosition -= 100
  page.drawText('Key Findings:', { x: margin + 20, y: yPosition, size: 11, font: boldFont, color: textDark })
  yPosition -= 20
  
  const exemplary = domainScores.filter(d => d.score >= 4).length
  const proficient = domainScores.filter(d => d.score >= 3 && d.score < 4).length
  const developing = domainScores.filter(d => d.score >= 2 && d.score < 3).length
  const notEvident = domainScores.filter(d => d.score < 2).length
  
  const findings = [
    `• ${exemplary} standard${exemplary !== 1 ? 's' : ''} at Exemplary level`,
    `• ${proficient} standard${proficient !== 1 ? 's' : ''} at Proficient level`,
    `• ${developing} standard${developing !== 1 ? 's' : ''} in Developing stage`,
    `• ${notEvident} standard${notEvident !== 1 ? 's' : ''} Not Evident`,
  ]
  
  for (const finding of findings) {
    page.drawText(finding, { x: margin + 30, y: yPosition, size: 10, font: regularFont, color: textDark })
    yPosition -= 16
  }
  
  // PAGE 2: STANDARDS BREAKDOWN
  let result = addPage()
  page = result.page
  yPosition = result.yPosition
  
  yPosition = drawSectionHeader(page, yPosition, '2. PSI Standards Performance')
  
  for (const domain of domainScores) {
    if (yPosition < 150) {
      result = addPage()
      page = result.page
      yPosition = result.yPosition - 40
    }
    
    const scoreColor = getScoreColorRGB(domain.score)
    page.drawRectangle({ x: margin, y: yPosition - 60, width: contentWidth, height: 60, color: rgb(0.99, 0.99, 1), borderColor: rgb(0.90, 0.91, 0.93), borderWidth: 1 })
    page.drawText((domain.domain as any).name, { x: margin + 15, y: yPosition - 25, size: 12, font: boldFont, color: textDark })
    page.drawText(domain.score.toFixed(1), { x: pageWidth - margin - 80, y: yPosition - 30, size: 24, font: boldFont, color: scoreColor })
    page.drawText(getScoreLabel(Math.round(domain.score)), { x: pageWidth - margin - 80, y: yPosition - 48, size: 8, font: regularFont, color: scoreColor })
    
    const barWidth = 200
    const barHeight = 8
    const barX = margin + 15
    const barY = yPosition - 48
    page.drawRectangle({ x: barX, y: barY, width: barWidth, height: barHeight, color: rgb(0.93, 0.94, 0.95) })
    page.drawRectangle({ x: barX, y: barY, width: (domain.score / 5) * barWidth, height: barHeight, color: scoreColor })
    
    yPosition -= 75
  }
  
  // PAGE 3: TOP 3 PRIORITIES
  result = addPage()
  page = result.page
  yPosition = result.yPosition
  
  yPosition = drawSectionHeader(page, yPosition, '3. Top 3 Priority Areas')
  
  page.drawText('Based on the assessment, these areas require immediate focused attention:', { x: margin + 20, y: yPosition, size: 10, font: regularFont, color: textGray })
  yPosition -= 30
  
  const priorities = sortedDomains.slice(0, 3)
  
  for (let i = 0; i < priorities.length; i++) {
    const priority = priorities[i]
    
    if (yPosition < 180) {
      result = addPage()
      page = result.page
      yPosition = result.yPosition - 40
    }
    
    page.drawRectangle({ x: margin, y: yPosition - 100, width: contentWidth, height: 100, color: lightGray, borderColor: getScoreColorRGB(priority.score), borderWidth: 2 })
    
    page.drawText(`Priority ${i + 1}`, { x: margin + 15, y: yPosition - 20, size: 10, font: boldFont, color: primary })
    page.drawText((priority.domain as any).name, { x: margin + 15, y: yPosition - 38, size: 13, font: boldFont, color: textDark })
    page.drawText(`Current Score: ${priority.score.toFixed(1)} - ${getScoreLabel(Math.round(priority.score))}`, { x: margin + 15, y: yPosition - 56, size: 9, font: regularFont, color: getScoreColorRGB(priority.score) })
    
    const recommendations: Record<string, string> = {
      'Foundations': 'Strengthen biblical integration and Christian worldview across all areas.',
      'Leadership & Personnel': 'Develop leadership capacity and ensure qualified, aligned staff.',
      'Teaching & Learning': 'Enhance instructional quality and student engagement strategies.',
      'Spiritual Formation': 'Deepen spiritual practices and integrate faith across curriculum.',
      'Student Services': 'Improve support systems and ensure comprehensive student care.',
      'School Culture': 'Build positive relationships and strengthen community engagement.',
      'School Improvement': 'Establish clear vision, strategic planning, and assessment systems.',
    }
    
    const recLines = wrapText(recommendations[(priority.domain as any).name] || 'Focus on strengthening this area.', contentWidth - 50, 9)
    let recY = yPosition - 72
    for (const line of recLines) {
      page.drawText(line, { x: margin + 15, y: recY, size: 9, font: regularFont, color: textDark })
      recY -= 12
    }
    
    yPosition -= 115
  }
  
  // PAGE 4: 90-DAY ACTION PLAN
  result = addPage()
  page = result.page
  yPosition = result.yPosition
  
  yPosition = drawSectionHeader(page, yPosition, '4. 90-Day Action Plan')
  
  page.drawText('Recommended timeline for addressing priority areas:', { x: margin + 20, y: yPosition, size: 10, font: regularFont, color: textGray })
  yPosition -= 30
  
  const phases = [
    { title: 'Days 1-30: Assessment & Planning', actions: ['Review findings with leadership team', 'Identify quick wins and immediate actions', 'Assign responsibility for each priority area'] },
    { title: 'Days 31-60: Implementation', actions: ['Launch improvement initiatives', 'Provide necessary training and resources', 'Monitor progress weekly'] },
    { title: 'Days 61-90: Review & Adjustment', actions: ['Assess progress on priorities', 'Adjust strategies as needed', 'Plan next 90-day cycle'] },
  ]
  
  for (const phase of phases) {
    if (yPosition < 180) {
      result = addPage()
      page = result.page
      yPosition = result.yPosition - 40
    }
    
    page.drawText(phase.title, { x: margin + 15, y: yPosition, size: 11, font: boldFont, color: primary })
    yPosition -= 18
    
    for (const action of phase.actions) {
      page.drawText(`• ${action}`, { x: margin + 25, y: yPosition, size: 9, font: regularFont, color: textDark })
      yPosition -= 14
    }
    yPosition -= 10
  }
  
  // PAGE 5: SIGNATURE SECTION
  result = addPage()
  page = result.page
  yPosition = result.yPosition
  
  yPosition = drawSectionHeader(page, yPosition, '5. Acknowledgment & Commitment')
  
  page.drawText('This report has been reviewed and discussed with the school leadership team.', { x: margin + 20, y: yPosition, size: 10, font: regularFont, color: textGray })
  yPosition -= 40
  
  const signatureBoxHeight = 100
  const signatureBoxWidth = (contentWidth - 30) / 2
  
  // ACSI Mentor Signature
  page.drawRectangle({ x: margin, y: yPosition - signatureBoxHeight, width: signatureBoxWidth, height: signatureBoxHeight, color: lightGray, borderColor: rgb(0.85, 0.87, 0.89), borderWidth: 1 })
  page.drawText('ACSI Mentor', { x: margin + 15, y: yPosition - 20, size: 10, font: boldFont, color: textDark })
  page.drawLine({ start: { x: margin + 15, y: yPosition - 50 }, end: { x: margin + signatureBoxWidth - 15, y: yPosition - 50 }, thickness: 1, color: textGray })
  page.drawText('Signature', { x: margin + 15, y: yPosition - 65, size: 8, font: regularFont, color: textGray })
  page.drawLine({ start: { x: margin + 15, y: yPosition - 82 }, end: { x: margin + signatureBoxWidth - 15, y: yPosition - 82 }, thickness: 1, color: textGray })
  page.drawText('Date', { x: margin + 15, y: yPosition - 95, size: 8, font: regularFont, color: textGray })
  
  // School Leader Signature
  page.drawRectangle({ x: margin + signatureBoxWidth + 30, y: yPosition - signatureBoxHeight, width: signatureBoxWidth, height: signatureBoxHeight, color: lightGray, borderColor: rgb(0.85, 0.87, 0.89), borderWidth: 1 })
  page.drawText('School Leader', { x: margin + signatureBoxWidth + 45, y: yPosition - 20, size: 10, font: boldFont, color: textDark })
  page.drawLine({ start: { x: margin + signatureBoxWidth + 45, y: yPosition - 50 }, end: { x: pageWidth - margin - 15, y: yPosition - 50 }, thickness: 1, color: textGray })
  page.drawText('Signature', { x: margin + signatureBoxWidth + 45, y: yPosition - 65, size: 8, font: regularFont, color: textGray })
  page.drawLine({ start: { x: margin + signatureBoxWidth + 45, y: yPosition - 82 }, end: { x: pageWidth - margin - 15, y: yPosition - 82 }, thickness: 1, color: textGray })
  page.drawText('Date', { x: margin + signatureBoxWidth + 45, y: yPosition - 95, size: 8, font: regularFont, color: textGray })
  
  yPosition -= signatureBoxHeight + 40
  
  page.drawText('Next Review Date: _________________________', { x: margin + 20, y: yPosition, size: 10, font: regularFont, color: textDark })
  
  // Footer
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1]
  lastPage.drawText(`ACSI Kenya PSI Health Check Report - Generated ${new Date().toLocaleDateString()}`, { x: margin, y: 30, size: 8, font: regularFont, color: textGray })
  
  // Save
  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as any], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${school.name.replace(/\s+/g, '_')}_PSI_Health_Check_${new Date().toISOString().split('T')[0]}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
