'use client'

import React from 'react'
import { ArrowLeft, Loader2, Sparkles, CheckCircle, AlertTriangle, Target, Users, DollarSign, Calendar, Copy, Check } from 'lucide-react'
import { GoalDefinition } from '@/types/decision'

interface ReviewStepProps {
  goal: Partial<GoalDefinition>
  onRefine: () => void
  onBack: () => void
  onUseGoal: (refinedGoal: string) => void
  isRefining: boolean
}

export function ReviewStep({ goal, onRefine, onBack, onUseGoal, isRefining }: ReviewStepProps) {
  const [copied, setCopied] = React.useState(false)
  const hasRefinedGoal = goal.refinedGoal?.statement

  const handleCopy = async () => {
    if (goal.refinedGoal?.statement) {
      await navigator.clipboard.writeText(goal.refinedGoal.statement)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getConfidenceColor = (level: GoalDefinition['refinedGoal']['confidenceLevel']) => {
    switch (level) {
      case 'high': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
      case 'low': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary of Inputs */}
      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Summary of Your Inputs</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <Target size={14} className="mt-0.5 text-violet-500" />
              <div>
                <span className="text-gray-500 dark:text-gray-400">Outcome:</span>
                <p className="text-gray-900 dark:text-white">{goal.specificity?.concreteOutcome || 'Not defined'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users size={14} className="mt-0.5 text-blue-500" />
              <div>
                <span className="text-gray-500 dark:text-gray-400">Stakeholders:</span>
                <p className="text-gray-900 dark:text-white">{goal.specificity?.stakeholders.length || 0} defined</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <DollarSign size={14} className="mt-0.5 text-green-500" />
              <div>
                <span className="text-gray-500 dark:text-gray-400">Constraints:</span>
                <p className="text-gray-900 dark:text-white">{goal.resources?.constraints.length || 0} identified</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar size={14} className="mt-0.5 text-orange-500" />
              <div>
                <span className="text-gray-500 dark:text-gray-400">Deadline:</span>
                <p className="text-gray-900 dark:text-white">{goal.timeline?.deadline || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle size={14} className="mt-0.5 text-violet-500" />
            <div>
              <span className="text-gray-500 dark:text-gray-400">Success Criteria:</span>
              <p className="text-gray-900 dark:text-white">{goal.successCriteria?.length || 0} defined</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refine Button */}
      {!hasRefinedGoal && (
        <div className="text-center py-4">
          <button
            onClick={onRefine}
            disabled={isRefining}
            className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
          >
            {isRefining ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Synthesizing Refined Goal...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Refined Goal Statement
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Claude will synthesize all your inputs into a clear, actionable goal statement
          </p>
        </div>
      )}

      {/* Refined Goal */}
      {hasRefinedGoal && goal.refinedGoal && (
        <div className="space-y-4">
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-violet-900 dark:text-violet-100 flex items-center gap-2">
                <Sparkles size={18} />
                Refined Goal Statement
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded ${getConfidenceColor(goal.refinedGoal.confidenceLevel)}`}>
                  {goal.refinedGoal.confidenceLevel} confidence
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <p className="text-violet-800 dark:text-violet-200 leading-relaxed">
              {goal.refinedGoal.statement}
            </p>
          </div>

          {/* SMART Breakdown */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">SMART Analysis</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(goal.refinedGoal.smartBreakdown).map(([key, value]) => (
                <div key={key} className="flex gap-3">
                  <span className="font-medium text-violet-600 dark:text-violet-400 w-24 capitalize">{key}:</span>
                  <span className="text-gray-700 dark:text-gray-300 flex-1">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Assumptions */}
          {goal.refinedGoal.keyAssumptions.length > 0 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2 flex items-center gap-2">
                <AlertTriangle size={16} />
                Key Assumptions
              </h4>
              <ul className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                {goal.refinedGoal.keyAssumptions.map((assumption, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-yellow-600">•</span>
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Probability */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Success Probability</span>
                <span className="text-lg font-bold text-violet-600 dark:text-violet-400">{goal.refinedGoal.successProbability}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-600 rounded-full transition-all"
                  style={{ width: `${goal.refinedGoal.successProbability}%` }}
                />
              </div>
            </div>
          </div>

          {/* Use Goal Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => onUseGoal(goal.refinedGoal!.statement)}
              className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium text-lg"
            >
              Use This Goal for Analysis
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Timeline
        </button>
        {hasRefinedGoal && (
          <button
            onClick={onRefine}
            disabled={isRefining}
            className="flex items-center gap-2 px-4 py-2 text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
          >
            <Sparkles size={16} />
            Regenerate
          </button>
        )}
      </div>
    </div>
  )
}
