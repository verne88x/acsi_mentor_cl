'use client'

import { useState } from 'react'
import { HEALTH_CHECK_DOMAINS, calculateOverallScore } from '@/lib/config/healthCheckConfig'
import ScorePills from '@/components/ScorePills'

interface PublicAssessmentFormProps {
  school: any
  linkId: string
  token: string
}

export default function PublicAssessmentForm({ school, linkId, token }: PublicAssessmentFormProps) {
  const [step, setStep] = useState<'info' | 'assessment' | 'submitted'>('info')
  const [respondentName, setRespondentName] = useState('')
  const [respondentRole, setRespondentRole] = useState('')
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [responses, setResponses] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [dataProtectionAccepted, setDataProtectionAccepted] = useState(false)

  const currentDomain = HEALTH_CHECK_DOMAINS[currentDomainIndex]
  const domainResponse = responses[currentDomain?.code] || { score: 0, notes: '', questions: {} }

  const updateQuestionScore = (questionId: string, score: number) => {
    setResponses((prev: any) => {
      const updated = {
        ...prev,
        [currentDomain.code]: {
          ...domainResponse,
          questions: { ...domainResponse.questions, [questionId]: { score } },
        },
      }
      const questionScores = Object.values(updated[currentDomain.code].questions)
        .map((q: any) => q.score).filter(Boolean)
      if (questionScores.length > 0) {
        updated[currentDomain.code].score = questionScores.reduce((a: number, b: number) => a + b, 0) / questionScores.length
      }
      return updated
    })
  }

  const canProgress = () => currentDomain.questions.every(
    (q) => domainResponse.questions[q.id]?.score
  )

  const handleSubmit = async () => {
    setSaving(true)
    try {
      const overallScore = calculateOverallScore(responses)
      const response = await fetch('/api/assessments/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: school.id,
          assessment_link_id: linkId,
          respondent_name: respondentName,
          respondent_role: respondentRole,
          responses,
          overall_score: overallScore,
        }),
      })
      if (!response.ok) throw new Error('Failed to submit')
      setStep('submitted')
    } catch (error) {
      alert('Failed to submit assessment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (step === 'submitted') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', padding: '2rem', textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Thank you, {respondentName}!
        </h1>
        <p style={{ color: '#6b7280', maxWidth: '400px' }}>
          Your assessment for <strong>{school.name}</strong> has been submitted successfully.
          Your mentor will review your responses.
        </p>
      </div>
    )
  }

  if (step === 'info') {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem' }}>
        <div style={{
          background: 'white', borderRadius: '12px', padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Health Check Assessment
            </h1>
            <p style={{ color: '#6b7280' }}>{school.name}</p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Your Full Name *
            </label>
            <input
              type="text"
              value={respondentName}
              onChange={(e) => setRespondentName(e.target.value)}
              placeholder="e.g. John Kamau"
              style={{
                width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
              Your Role at the School *
            </label>
            <select
              value={respondentRole}
              onChange={(e) => setRespondentRole(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem', border: '1px solid #d1d5db',
                borderRadius: '6px', fontSize: '1rem', boxSizing: 'border-box',
                background: 'white'
              }}
            >
              <option value="">Select your role...</option>
              <option value="Principal / Head Teacher">Principal / Head Teacher</option>
              <option value="Deputy Head Teacher">Deputy Head Teacher</option>
              <option value="Teacher">Teacher</option>
              <option value="Finance Officer">Finance Officer</option>
              <option value="Board Member">Board Member</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Data Protection */}
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0',
            borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.75rem' }}>
              <strong>Data Protection Notice:</strong> The information you provide in this assessment
              will be used by ACSI Kenya mentors to support school improvement. Your responses will
              be kept confidential and only shared with authorized ACSI personnel.
            </p>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={dataProtectionAccepted}
                onChange={(e) => setDataProtectionAccepted(e.target.checked)}
              />
              <span style={{ fontSize: '0.875rem' }}>
                I understand and agree to the data protection notice above.
              </span>
            </label>
          </div>

          <button
            onClick={() => setStep('assessment')}
            disabled={!respondentName || !respondentRole || !dataProtectionAccepted}
            style={{
              width: '100%', padding: '0.875rem',
              background: respondentName && respondentRole && dataProtectionAccepted ? '#3b82f6' : '#d1d5db',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '1rem', fontWeight: '600',
              cursor: respondentName && respondentRole && dataProtectionAccepted ? 'pointer' : 'not-allowed'
            }}
          >
            Start Assessment →
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentDomainIndex + 1) / HEALTH_CHECK_DOMAINS.length) * 100

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Health Check – {school.name}</h1>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Filling out as: {respondentName} ({respondentRole})
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            <span>Domain {currentDomainIndex + 1} of {HEALTH_CHECK_DOMAINS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div style={{ background: '#e5e7eb', borderRadius: '999px', height: '8px' }}>
            <div style={{ background: '#3b82f6', borderRadius: '999px', height: '8px', width: `${progress}%`, transition: 'width 0.3s' }} />
          </div>
        </div>

        {/* Domain */}
        <h2 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', color: '#1f2937' }}>
          {currentDomain.label}
        </h2>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {currentDomain.questions.map((question, idx) => {
            const score = domainResponse.questions[question.id]?.score || 0
            return (
              <div key={question.id} style={{ padding: '1rem', background: '#f9fafb', borderRadius: '8px' }}>
                <p style={{ marginBottom: '0.75rem', fontWeight: '500' }}>
                  {idx + 1}. {question.text}
                </p>
                <ScorePills value={score} onChange={(s) => updateQuestionScore(question.id, s)} />
              </div>
            )
          })}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
            Notes (optional)
          </label>
          <textarea
            value={domainResponse.notes}
            onChange={(e) => setResponses((prev: any) => ({
              ...prev,
              [currentDomain.code]: { ...domainResponse, notes: e.target.value }
            }))}
            placeholder="Add observations or comments..."
            rows={3}
            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }}
          />
        </div>

        {/* Scoring guide */}
        <div style={{ background: '#f0f9ff', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.75rem', color: '#374151' }}>
          <strong>Scoring:</strong> 1 = Critical Need · 2 = Significant Gaps · 3 = Developing · 4 = Good · 5 = Excellent
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={() => setCurrentDomainIndex(i => i - 1)}
            disabled={currentDomainIndex === 0}
            style={{
              padding: '0.75rem 1.5rem', background: '#f3f4f6', border: 'none',
              borderRadius: '6px', fontWeight: '500', cursor: currentDomainIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentDomainIndex === 0 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          {currentDomainIndex < HEALTH_CHECK_DOMAINS.length - 1 ? (
            <button
              onClick={() => { setCurrentDomainIndex(i => i + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              disabled={!canProgress()}
              style={{
                padding: '0.75rem 1.5rem', background: canProgress() ? '#3b82f6' : '#d1d5db',
                color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600',
                cursor: canProgress() ? 'pointer' : 'not-allowed'
              }}
            >
              Next Domain →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProgress() || saving}
              style={{
                padding: '0.75rem 1.5rem', background: canProgress() && !saving ? '#10b981' : '#d1d5db',
                color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600',
                cursor: canProgress() && !saving ? 'pointer' : 'not-allowed'
              }}
            >
              {saving ? 'Submitting...' : '✓ Submit Assessment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
