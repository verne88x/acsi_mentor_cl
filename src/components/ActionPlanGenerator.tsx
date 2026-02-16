'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Assessment, School } from '@/types'
import { HEALTH_CHECK_DOMAINS, getScoreColor, getScoreLabel } from '@/lib/config/healthCheckConfig'
import { generateSuggestedActions } from '@/lib/config/planTemplates'
import { generateAssessmentPDF } from '@/lib/pdf/pdfGenerator'
import styles from './ActionPlanGenerator.module.css'

interface ActionPlanGeneratorProps {
  assessment: Assessment & { school: School }
  school: School
}

export default function ActionPlanGenerator({ assessment, school }: ActionPlanGeneratorProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)

  // Calculate domain scores
  const domainScores = HEALTH_CHECK_DOMAINS.map((domain) => {
    const response = assessment.responses[domain.code]
    return {
      domain,
      score: response?.score || 0,
    }
  }).sort((a, b) => a.score - b.score)

  const priorityDomains = domainScores.filter((d) => d.score < 4)
  const suggestedActions = generateSuggestedActions(assessment.responses)

  const handleSavePlan = async () => {
    setSaving(true)

    try {
      // Create action plan
      const { data, error: planError } = await supabase
        .from('action_plans')
        .insert({
          school_id: school.id,
          assessment_id: assessment.id,
          created_by: assessment.conducted_by,
          title: `Action Plan - ${new Date().toLocaleDateString()}`,
          description: `Generated from health check assessment`,
          status: 'active' as const,
          start_date: new Date().toISOString().split('T')[0],
        } as any)
        .select()
        .single()

      if (planError) throw planError
      
      const plan = data as any

      // Create action items
      const items = suggestedActions.map((action) => ({
        plan_id: plan.id,
        domain: action.domain,
        description: action.description,
        owner_name: action.owner_name,
        kpi: action.kpi,
        priority: action.priority,
        status: 'pending' as const,
      }))

      const { error: itemsError } = await supabase
        .from('action_items')
        .insert(items as any)

      if (itemsError) throw itemsError

      router.push(`/schools/${school.id}`)
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save action plan. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await generateAssessmentPDF(assessment, school, domainScores)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setExporting(false)
    }
  }

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
          <h1>Action Plan</h1>
          <p>{school.name}</p>
        </div>

        {/* Assessment Summary */}
        <div className={styles.summarySection}>
          <h2>Assessment Summary</h2>
          <div className={styles.summaryGrid}>
            {domainScores.map(({ domain, score }) => (
              <div key={domain.code} className={styles.summaryCard}>
                <div className={styles.summaryLabel}>{domain.label}</div>
                <div className={styles.summaryScore}>
                  <span
                    className={styles.scoreValue}
                    style={{ color: getScoreColor(score) }}
                  >
                    {score.toFixed(1)}
                  </span>
                  <span className={styles.scoreLabel}>
                    {getScoreLabel(score)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Areas */}
        <div className={styles.prioritySection}>
          <h2>Priority Areas for Improvement</h2>
          
          {priorityDomains.length === 0 ? (
            <div className={styles.successMessage}>
              🎉 Excellent! All domains are performing well. Consider maintaining current practices and celebrating this success with the school.
            </div>
          ) : (
            <>
              <p className={styles.priorityIntro}>
                Based on the assessment, here are suggested action items for domains scoring below 4.0:
              </p>
              
              <div className={styles.actionsList}>
                {suggestedActions.map((action, idx) => {
                  const domain = HEALTH_CHECK_DOMAINS.find(d => d.code === action.domain)
                  const domainScore = domainScores.find(d => d.domain.code === action.domain)
                  
                  return (
                    <div key={idx} className={styles.actionCard}>
                      <div 
                        className={styles.actionHeader}
                        style={{ 
                          background: getScoreColor(domainScore?.score || 0),
                        }}
                      >
                        <div>
                          <div className={styles.actionDomain}>
                            {domain?.label}
                          </div>
                          <div className={styles.actionPriority}>
                            Priority: {action.priority === 1 ? 'High' : action.priority === 2 ? 'Medium' : 'Low'}
                          </div>
                        </div>
                        <div className={styles.actionScore}>
                          Score: {domainScore?.score.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className={styles.actionBody}>
                        <div className={styles.actionDescription}>
                          {action.description}
                        </div>
                        
                        <div className={styles.actionMeta}>
                          <div className={styles.metaItem}>
                            <strong>Owner:</strong> {action.owner_name}
                          </div>
                          {action.kpi && (
                            <div className={styles.metaItem}>
                              <strong>KPI:</strong> {action.kpi}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actionsBar}>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className={styles.secondaryButton}
          >
            {exporting ? 'Generating PDF...' : 'Export as PDF'}
          </button>
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className={styles.primaryButton}
          >
            {saving ? 'Saving...' : 'Save Action Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
