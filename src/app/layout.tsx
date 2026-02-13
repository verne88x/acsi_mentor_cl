import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ACSI School Mentor',
  description: 'Mentoring platform for ACSI schools in Kenya',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
