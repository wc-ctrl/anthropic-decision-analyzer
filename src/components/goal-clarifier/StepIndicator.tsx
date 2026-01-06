'use client'

import React from 'react'
import { Check, Circle } from 'lucide-react'
import { GoalClarifierStep } from '@/types/decision'

interface StepIndicatorProps {
  currentStep: GoalClarifierStep
  onStepClick?: (step: GoalClarifierStep) => void
  completedSteps: GoalClarifierStep[]
}

const STEPS: { key: GoalClarifierStep; label: string; shortLabel: string }[] = [
  { key: 'initial', label: 'Initial Goal', shortLabel: '1' },
  { key: 'specificity', label: 'Specificity', shortLabel: '2' },
  { key: 'criteria', label: 'Success Criteria', shortLabel: '3' },
  { key: 'constraints', label: 'Resources', shortLabel: '4' },
  { key: 'timeline', label: 'Timeline', shortLabel: '5' },
  { key: 'review', label: 'Review', shortLabel: '6' },
]

export function StepIndicator({ currentStep, onStepClick, completedSteps }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep)

  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, index) => {
        const isCompleted = completedSteps.includes(step.key)
        const isCurrent = step.key === currentStep
        const isPast = index < currentIndex
        const isClickable = onStepClick && (isCompleted || isPast || isCurrent)

        return (
          <React.Fragment key={step.key}>
            <button
              onClick={() => isClickable && onStepClick?.(step.key)}
              disabled={!isClickable}
              className={`flex flex-col items-center gap-1 group ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isCompleted
                    ? 'bg-violet-600 text-white'
                    : isCurrent
                    ? 'bg-violet-100 dark:bg-violet-900/40 border-2 border-violet-600 text-violet-600 dark:text-violet-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                } ${isClickable ? 'group-hover:ring-2 group-hover:ring-violet-300 dark:group-hover:ring-violet-700' : ''}`}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : (
                  <span className="text-sm font-medium">{step.shortLabel}</span>
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${
                  isCurrent
                    ? 'text-violet-600 dark:text-violet-400'
                    : isCompleted
                    ? 'text-gray-700 dark:text-gray-300'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  index < currentIndex || completedSteps.includes(STEPS[index + 1].key)
                    ? 'bg-violet-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
