'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { School, AssessmentResponses, DomainResponse } from '@/types'
import { HEALTH_CHECK_DOMAINS, calculateOverallScore } from '@/lib/config/healthCheckConfig'
import ScorePills from '@/components/ScorePills'
import styles from './AssessmentForm.module.css'

interface AssessmentFormProps {
  school: School
  userId: string
}

export default function AssessmentForm({ school, userId }: AssessmentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [currentDomainIndex, setCurrentDomainIndex] = useState(0)
  const [responses, setResponses] = useState<AssessmentResponses>({})
  const [saving, setSaving] = useState(false)

  const currentDomain = HEALTH_CHECK_DOMAINS[currentDomainIndex]
  const domainResponse: DomainResponse = responses[currentDomain.code] || {
    score: 0,
    notes: '',
    questions: {},
  }

  const updateQuestionScore = (questionId: string, score: number) => {
    setResponses((prev) => {
      const updated = {
        ...prev,
        [currentDomain.code]: {
          ...domainResponse,
          questions: {
            ...domainResponse.questions,
            [questionId]: { score },
          },
        },
      }

      // Recalculate domain score
      const questionScores = Object.values(updated[currentDomain.code].questions)
        .map((q) => q.score)
        .filter(Boolean)
      
      if (questionScores.length > 0) {
        updated[currentDomain.code].score =
          questionScores.reduce((a, b) => a + b, 0) / questionScores.length
      }

      return updated
    })
  }

  const updateNotes = (notes: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentDomain.code]: {
        ...domainResponse,
        notes,
      },
    }))
  }

  const canProgress = () => {
    return currentDomain.questions.every(
      (q) => domainResponse.questions[q.id]?.score
    )
  }

  const handleNext = () => {
    if (currentDomainIndex < HEALTH_CHECK_DOMAINS.length - 1) {
      setCurrentDomainIndex(currentDomainIndex + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentDomainIndex > 0) {
      setCurrentDomainIndex(currentDomainIndex - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSave = async (status: 'draft' | 'completed') => {
    setSaving(true)

    try {
      const overallScore = calculateOverallScore(responses)

      const { data, error } = await supabase
        .from('assessments')
        .insert({
          school_id: school.id,
          conducted_by: userId,
          assessment_date: new Date().toISOString().split('T')[0],
          status: status,
          responses: responses,
          overall_score: overallScore,
        } as any)
        .select()
        .single()

      if (error) throw error

      const assessmentData = data as any

      if (status === 'completed') {
        router.push(`/schools/${school.id}/assessment/${assessmentData.id}/plan`)
      } else {
        router.push(`/schools/${school.id}`)
      }
    } catch (error) {
      console.error('Error saving assessment:', error)
      alert('Failed to save assessment. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const progress = ((currentDomainIndex + 1) / HEALTH_CHECK_DOMAINS.length) * 100

  return (
    <div className={styles.container}>
      <button
        onClick={() => router.push(`/schools/${school.id}`)}
        className={styles.backButton}
      >
        ← Back to School
      </button>

      <div className={styles.card}>
        <div className={styles.header}>
          <h1>Health Check Assessment</h1>
          <p>{school.name}</p>
        </div>

        {/* Progress Bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressLabels}>
            <span className={styles.progressText}>
              Domain {currentDomainIndex + 1} of {HEALTH_CHECK_DOMAINS.length}
            </span>
            <span className={styles.progressPercentage}>
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Domain Header */}
        <div className={styles.domainHeader}>
          <h2>{currentDomain.label}</h2>
          {domainResponse.score > 0 && (
            <div className={styles.domainScore}>
              Current Score: {domainResponse.score.toFixed(1)}/5.0
            </div>
          )}
        </div>

        {/* Questions */}
        <div className={styles.questionsSection}>
          {currentDomain.questions.map((question, idx) => {
            const score = domainResponse.questions[question.id]?.score || 0

            return (
              <div key={question.id} className={styles.questionCard}>
                <div className={styles.questionText}>
                  <span className={styles.questionNumber}>{idx + 1}.</span>
                  <span>{question.text}</span>
                </div>
                <ScorePills
                  value={score}
                  onChange={(newScore) => updateQuestionScore(question.id, newScore)}
                />
              </div>
            )
          })}
        </div>

        {/* Notes */}
        <div className={styles.notesSection}>
          <label htmlFor="notes">
            Notes for this domain (optional)
          </label>
          <textarea
            id="notes"
            value={domainResponse.notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder="Add any observations, concerns, or recommendations..."
            rows={4}
          />
        </div>

        {/* Scoring Guide */}
        <div className={styles.scoringGuide}>
          <div className={styles.guideTitle}>SCORING GUIDE</div>
          <div className={styles.guideGrid}>
            <div><strong>1:</strong> Critical Need</div>
            <div><strong>2:</strong> Significant Gaps</div>
            <div><strong>3:</strong> Developing</div>
            <div><strong>4:</strong> Good</div>
            <div><strong>5:</strong> Excellent</div>
          </div>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            onClick={handlePrevious}
            disabled={currentDomainIndex === 0}
            className={styles.secondaryButton}
          >
            Previous
          </button>

          <div className={styles.navigationRight}>
            {currentDomainIndex < HEALTH_CHECK_DOMAINS.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProgress()}
                className={styles.primaryButton}
              >
                Next Domain
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className={styles.secondaryButton}
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave('completed')}
                  disabled={!canProgress() || saving}
                  className={styles.primaryButton}
                >
                  {saving ? 'Saving...' : 'Complete Assessment'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
