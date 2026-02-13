'use client'

import styles from './ScorePills.module.css'

interface ScorePillsProps {
  value: number
  onChange: (score: number) => void
}

export default function ScorePills({ value, onChange }: ScorePillsProps) {
  const options = [1, 2, 3, 4, 5]

  return (
    <div className={styles.container}>
      {options.map((score) => (
        <button
          key={score}
          type="button"
          onClick={() => onChange(score)}
          className={value === score ? styles.pillActive : styles.pill}
        >
          {score}
        </button>
      ))}
    </div>
  )
}
