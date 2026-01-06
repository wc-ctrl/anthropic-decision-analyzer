'use client'

import React from 'react'
import { AlertTriangle, Lightbulb, ArrowRight, Loader2 } from 'lucide-react'
import { GoalDefinition, GoalGap } from '@/types/decision'

interface InitialInputStepProps {
  goal: Partial<GoalDefinition>
  onUpdateGoal: (updates: Partial<GoalDefinition>) => void
  onAnalyze: () => void
  onNext: () => void
  isAnalyzing: boolean
}

const getSeverityColor = (severity: GoalGap['severity']) => {
  switch (severity) {
    case 'major':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
    case 'moderate':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
    case 'minor':
      return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
  }
}

const getCategoryLabel = (category: GoalGap['category']) => {
  switch (category) {
    case 'specificity':
      return 'Specificity'
    case 'measurability':
      return 'Measurability'
    case 'achievability':
      return 'Achievability'
    case 'relevance':
      return 'Relevance'
    case 'timebound':
      return 'Time-bound'
  }
}

export function InitialInputStep({
  goal,
  onUpdateGoal,
  onAnalyze,
  onNext,
  isAnalyzing
}: InitialInputStepProps) {
  const hasAnalysis = goal.initialAnalysis?.gaps && goal.initialAnalysis.gaps.length > 0

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          What&apos;s your goal?
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Describe what you want to achieve. Don&apos;t worry about being too vague - we&apos;ll help you clarify it.
        </p>
        <textarea
          value={goal.rawInput || ''}
          onChange={(e) => onUpdateGoal({ rawInput: e.target.value })}
          placeholder="e.g., 'I want to grow my business' or 'We need to improve customer satisfaction' or 'Launch the new product successfully'"
          className="w-full h-32 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={onAnalyze}
            disabled={!goal.rawInput?.trim() || isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Lightbulb size={16} />
                Analyze Goal
              </>
            )}
          </button>
        </div>
      </div>

      {goal.initialAnalysis && (
        <div className="space-y-4">
          {/* AI Interpretation */}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
            <h3 className="font-medium text-violet-900 dark:text-violet-100 mb-2">
              AI Interpretation
            </h3>
            <p className="text-sm text-violet-800 dark:text-violet-200">
              {goal.initialAnalysis.interpretation}
            </p>
          </div>

          {/* Gaps Identified */}
          {hasAnalysis && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-yellow-500" />
                Gaps Identified ({goal.initialAnalysis.gaps.length})
              </h3>
              <div className="space-y-2">
                {goal.initialAnalysis.gaps.map((gap) => (
                  <div
                    key={gap.id}
                    className={`border rounded-lg p-3 ${getSeverityColor(gap.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-white/50 dark:bg-black/20">
                            {getCategoryLabel(gap.category)}
                          </span>
                          <span className="text-xs capitalize opacity-75">
                            {gap.severity}
                          </span>
                        </div>
                        <p className="text-sm">{gap.description}</p>
                      </div>
                    </div>
                    {gap.suggestedQuestion && (
                      <p className="text-xs mt-2 opacity-80 italic">
                        💡 {gap.suggestedQuestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clarifying Questions Preview */}
          {goal.initialAnalysis.clarifyingQuestions && goal.initialAnalysis.clarifyingQuestions.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Questions to Explore
              </h3>
              <ul className="space-y-2">
                {goal.initialAnalysis.clarifyingQuestions.slice(0, 3).map((q, i) => (
                  <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <span className="text-violet-500">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium"
            >
              Continue to Specificity
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
