'use client'

import React from 'react'
import { X, Crosshair } from 'lucide-react'
import { GoalDefinition, GoalClarifierStep, GoalClarifierState } from '@/types/decision'
import { StepIndicator } from './goal-clarifier/StepIndicator'
import { InitialInputStep } from './goal-clarifier/InitialInputStep'
import { SpecificityStep } from './goal-clarifier/SpecificityStep'
import { CriteriaStep } from './goal-clarifier/CriteriaStep'
import { ConstraintsStep } from './goal-clarifier/ConstraintsStep'
import { TimelineStep } from './goal-clarifier/TimelineStep'
import { ReviewStep } from './goal-clarifier/ReviewStep'

interface GoalClarifierModalProps {
  isOpen: boolean
  onClose: () => void
  state: GoalClarifierState
  onUpdateState: (updates: Partial<GoalClarifierState>) => void
  onAnalyzeGoal: () => void
  onRefineGoal: () => void
  onUseGoal: (refinedGoal: string) => void
}

const STEP_ORDER: GoalClarifierStep[] = ['initial', 'specificity', 'criteria', 'constraints', 'timeline', 'review']

const STEP_TITLES: Record<GoalClarifierStep, string> = {
  initial: 'Capture Your Goal',
  specificity: 'Define Specificity',
  criteria: 'Set Success Criteria',
  constraints: 'Assess Resources & Constraints',
  timeline: 'Set Timeline & Milestones',
  review: 'Review & Synthesize'
}

export function GoalClarifierModal({
  isOpen,
  onClose,
  state,
  onUpdateState,
  onAnalyzeGoal,
  onRefineGoal,
  onUseGoal
}: GoalClarifierModalProps) {
  if (!isOpen) return null

  const currentIndex = STEP_ORDER.indexOf(state.currentStep)
  const completedSteps = STEP_ORDER.slice(0, currentIndex) as GoalClarifierStep[]

  const goToStep = (step: GoalClarifierStep) => {
    onUpdateState({ currentStep: step })
  }

  const goNext = () => {
    const nextIndex = currentIndex + 1
    if (nextIndex < STEP_ORDER.length) {
      onUpdateState({ currentStep: STEP_ORDER[nextIndex] })
    }
  }

  const goBack = () => {
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      onUpdateState({ currentStep: STEP_ORDER[prevIndex] })
    }
  }

  const updateGoal = (updates: Partial<GoalDefinition>) => {
    onUpdateState({
      goal: {
        ...state.goal,
        ...updates
      }
    })
  }

  const renderStep = () => {
    switch (state.currentStep) {
      case 'initial':
        return (
          <InitialInputStep
            goal={state.goal}
            onUpdateGoal={updateGoal}
            onAnalyze={onAnalyzeGoal}
            onNext={goNext}
            isAnalyzing={state.isLoading}
          />
        )
      case 'specificity':
        return (
          <SpecificityStep
            goal={state.goal}
            onUpdateGoal={updateGoal}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 'criteria':
        return (
          <CriteriaStep
            goal={state.goal}
            onUpdateGoal={updateGoal}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 'constraints':
        return (
          <ConstraintsStep
            goal={state.goal}
            onUpdateGoal={updateGoal}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 'timeline':
        return (
          <TimelineStep
            goal={state.goal}
            onUpdateGoal={updateGoal}
            onNext={goNext}
            onBack={goBack}
          />
        )
      case 'review':
        return (
          <ReviewStep
            goal={state.goal}
            onRefine={onRefineGoal}
            onBack={goBack}
            onUseGoal={onUseGoal}
            isRefining={state.isLoading}
          />
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <Crosshair size={24} className="text-violet-600 dark:text-violet-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Goal Clarifier
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {STEP_TITLES[state.currentStep]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <StepIndicator
            currentStep={state.currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-250px)]">
          {state.error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
              {state.error}
            </div>
          )}
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Transform vague goals into actionable, resource-aware objectives
          </p>
        </div>
      </div>
    </div>
  )
}
