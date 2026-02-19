'use client'

import { useState } from 'react'

interface ShareAssessmentButtonProps {
  schoolId: string
}

export default function ShareAssessmentButton({ schoolId }: ShareAssessmentButtonProps) {
  const [link, setLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateLink = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/schools/${schoolId}/assessment-link`, {
        method: 'POST',
      })
      const data = await response.json()
      if (data.link) {
        setLink(data.link)
      }
    } catch (error) {
      alert('Failed to generate link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async () => {
    if (link) {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareWhatsApp = () => {
    if (link) {
      const message = `Please fill out this school health check assessment: ${link}`
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
    }
  }

  if (!link) {
    return (
      <button
        onClick={generateLink}
        disabled={loading}
        style={{
          padding: '0.75rem 1rem',
          background: loading ? '#d1d5db' : '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#15803d',
          fontWeight: '600',
          fontSize: '0.875rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          width: '100%',
        }}
      >
        {loading ? '⏳ Generating...' : '🔗 Share Assessment Link'}
      </button>
    )
  }

  return (
    <div style={{
      padding: '1rem',
      background: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '8px',
    }}>
      <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#15803d', marginBottom: '0.5rem' }}>
        🔗 Shareable Assessment Link (valid 30 days)
      </p>
      <div style={{
        background: 'white', border: '1px solid #d1d5db', borderRadius: '6px',
        padding: '0.5rem 0.75rem', fontSize: '0.75rem', color: '#374151',
        wordBreak: 'break-all', marginBottom: '0.75rem'
      }}>
        {link}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={copyLink}
          style={{
            flex: 1, padding: '0.5rem', background: copied ? '#10b981' : '#3b82f6',
            color: 'white', border: 'none', borderRadius: '6px',
            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {copied ? '✓ Copied!' : '📋 Copy Link'}
        </button>
        <button
          onClick={shareWhatsApp}
          style={{
            flex: 1, padding: '0.5rem', background: '#25D366',
            color: 'white', border: 'none', borderRadius: '6px',
            fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer'
          }}
        >
          WhatsApp
        </button>
        <button
          onClick={generateLink}
          style={{
            padding: '0.5rem', background: '#f3f4f6',
            color: '#374151', border: 'none', borderRadius: '6px',
            fontSize: '0.75rem', cursor: 'pointer'
          }}
        >
          New Link
        </button>
      </div>
    </div>
  )
}
