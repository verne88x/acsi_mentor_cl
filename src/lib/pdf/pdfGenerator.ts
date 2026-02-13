import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { Assessment, School } from '@/types'
import { HEALTH_CHECK_DOMAINS, getScoreLabel } from '@/lib/config/healthCheckConfig'

interface DomainScore {
  domain: typeof HEALTH_CHECK_DOMAINS[0]
  score: number
}

export async function generateAssessmentPDF(
  assessment: Assessment,
  school: School,
  domainScores: DomainScore[]
) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595, 842]) // A4 size
  const { width, height } = page.getSize()

  // Load fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Colors
  const primary = rgb(0.4, 0.49, 0.92) // #667eea
  const textDark = rgb(0.12, 0.16, 0.22) // #1f2937
  const textGray = rgb(0.42, 0.45, 0.50) // #6b7280

  let yPosition = height - 60

  // Header with branding
  page.drawRectangle({
    x: 0,
    y: yPosition - 40,
    width,
    height: 80,
    color: primary,
  })

  page.drawText('ACSI SCHOOL MENTOR', {
    x: 50,
    y: yPosition - 10,
    size: 24,
    font: boldFont,
    color: rgb(1, 1, 1),
  })

  page.drawText('Health Check Assessment Report', {
    x: 50,
    y: yPosition - 35,
    size: 14,
    font: regularFont,
    color: rgb(1, 1, 1),
  })

  yPosition -= 100

  // School Information
  page.drawText(school.name, {
    x: 50,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: textDark,
  })

  yPosition -= 25

  page.drawText(`${school.town}, ${school.county}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: regularFont,
    color: textGray,
  })

  yPosition -= 20

  page.drawText(`Assessment Date: ${new Date(assessment.assessment_date).toLocaleDateString()}`, {
    x: 50,
    y: yPosition,
    size: 12,
    font: regularFont,
    color: textGray,
  })

  yPosition -= 40

  // Overall Score
  page.drawText('Overall Score', {
    x: 50,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: textDark,
  })

  yPosition -= 30

  const overallScore = assessment.overall_score || 0
  const scoreColor = getScoreColorRGB(overallScore)

  page.drawRectangle({
    x: 50,
    y: yPosition - 50,
    width: 150,
    height: 60,
    color: scoreColor,
    opacity: 0.1,
    borderColor: scoreColor,
    borderWidth: 2,
  })

  page.drawText(overallScore.toFixed(1), {
    x: 75,
    y: yPosition - 25,
    size: 32,
    font: boldFont,
    color: scoreColor,
  })

  page.drawText('/ 5.0', {
    x: 130,
    y: yPosition - 25,
    size: 16,
    font: regularFont,
    color: textGray,
  })

  page.drawText(getScoreLabel(overallScore), {
    x: 220,
    y: yPosition - 20,
    size: 14,
    font: regularFont,
    color: textDark,
  })

  yPosition -= 90

  // Domain Scores Table
  page.drawText('Domain Scores', {
    x: 50,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: textDark,
  })

  yPosition -= 30

  // Table Header
  page.drawRectangle({
    x: 50,
    y: yPosition - 25,
    width: width - 100,
    height: 30,
    color: rgb(0.97, 0.98, 0.98),
  })

  page.drawText('Domain', {
    x: 60,
    y: yPosition - 15,
    size: 11,
    font: boldFont,
    color: textDark,
  })

  page.drawText('Score', {
    x: 400,
    y: yPosition - 15,
    size: 11,
    font: boldFont,
    color: textDark,
  })

  page.drawText('Rating', {
    x: 470,
    y: yPosition - 15,
    size: 11,
    font: boldFont,
    color: textDark,
  })

  yPosition -= 30

  // Domain Rows
  domainScores.forEach(({ domain, score }, index) => {
    const bgColor = index % 2 === 0 ? rgb(1, 1, 1) : rgb(0.98, 0.98, 0.99)
    
    page.drawRectangle({
      x: 50,
      y: yPosition - 25,
      width: width - 100,
      height: 30,
      color: bgColor,
    })

    page.drawText(domain.label, {
      x: 60,
      y: yPosition - 15,
      size: 10,
      font: regularFont,
      color: textDark,
    })

    const scoreColor = getScoreColorRGB(score)
    
    page.drawText(score.toFixed(1), {
      x: 410,
      y: yPosition - 15,
      size: 11,
      font: boldFont,
      color: scoreColor,
    })

    page.drawText(getScoreLabel(score), {
      x: 470,
      y: yPosition - 15,
      size: 9,
      font: regularFont,
      color: textGray,
    })

    yPosition -= 30

    // Add new page if needed
    if (yPosition < 100) {
      const newPage = pdfDoc.addPage([595, 842])
      yPosition = height - 60
    }
  })

  // Chart - Simple horizontal bar chart
  yPosition -= 40

  if (yPosition < 300) {
    const newPage = pdfDoc.addPage([595, 842])
    yPosition = height - 60
  }

  page.drawText('Visual Overview', {
    x: 50,
    y: yPosition,
    size: 16,
    font: boldFont,
    color: textDark,
  })

  yPosition -= 40

  const chartHeight = 20
  const maxBarWidth = 400

  domainScores.forEach(({ domain, score }) => {
    // Domain label
    page.drawText(domain.label.substring(0, 18), {
      x: 60,
      y: yPosition - 12,
      size: 9,
      font: regularFont,
      color: textDark,
    })

    // Bar background
    page.drawRectangle({
      x: 200,
      y: yPosition - chartHeight,
      width: maxBarWidth,
      height: chartHeight,
      color: rgb(0.93, 0.94, 0.95),
    })

    // Bar fill
    const barWidth = (score / 5) * maxBarWidth
    const barColor = getScoreColorRGB(score)
    
    page.drawRectangle({
      x: 200,
      y: yPosition - chartHeight,
      width: barWidth,
      height: chartHeight,
      color: barColor,
      opacity: 0.8,
    })

    // Score label
    page.drawText(score.toFixed(1), {
      x: 610,
      y: yPosition - 12,
      size: 10,
      font: boldFont,
      color: barColor,
    })

    yPosition -= 35
  })

  // Footer
  const footerY = 40
  page.drawText('Generated by ACSI School Mentor Platform', {
    x: 50,
    y: footerY,
    size: 8,
    font: regularFont,
    color: textGray,
  })

  page.drawText(`${new Date().toLocaleDateString()}`, {
    x: width - 150,
    y: footerY,
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
  link.download = `${school.name.replace(/\s+/g, '_')}_Assessment_${new Date().toISOString().split('T')[0]}.pdf`
  link.click()
  
  URL.revokeObjectURL(url)
}

function getScoreColorRGB(score: number) {
  if (score >= 4.5) return rgb(0.09, 0.64, 0.29) // green-600
  if (score >= 3.5) return rgb(0.13, 0.77, 0.37) // green-500
  if (score >= 2.5) return rgb(0.92, 0.70, 0.03) // yellow-500
  if (score >= 1.5) return rgb(0.92, 0.35, 0.05) // orange-600
  return rgb(0.86, 0.15, 0.15) // red-600
}
