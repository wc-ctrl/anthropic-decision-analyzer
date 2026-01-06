'use client'

import React from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, Target } from 'lucide-react'
import { GoalDefinition, SuccessCriterion } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

interface CriteriaStepProps {
  goal: Partial<GoalDefinition>
  onUpdateGoal: (updates: Partial<GoalDefinition>) => void
  onNext: () => void
  onBack: () => void
}

export function CriteriaStep({ goal, onUpdateGoal, onNext, onBack }: CriteriaStepProps) {
  const criteria = goal.successCriteria || []

  const addCriterion = () => {
    const newCriterion: SuccessCriterion = {
      id: uuidv4(),
      metric: '',
      minimum: '',
      ideal: '',
      measurementMethod: ''
    }
    onUpdateGoal({
      successCriteria: [...criteria, newCriterion]
    })
  }

  const updateCriterion = (id: string, updates: Partial<SuccessCriterion>) => {
    onUpdateGoal({
      successCriteria: criteria.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    })
  }

  const removeCriterion = (id: string) => {
    onUpdateGoal({
      successCriteria: criteria.filter(c => c.id !== id)
    })
  }

  const canProceed = criteria.length > 0 && criteria.some(c => c.metric.trim() && c.minimum.trim())

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Target size={16} className="inline mr-2" />
            Success Criteria
          </label>
          <button
            onClick={addCriterion}
            className="flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Criterion
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          How will you measure success? Define the metrics, minimum acceptable outcomes, and ideal outcomes.
        </p>

        {criteria.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <Target size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">
              No success criteria defined yet.
            </p>
            <button
              onClick={addCriterion}
              className="inline-flex items-center gap-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
            >
              <Plus size={16} />
              Add Your First Criterion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {criteria.map((criterion, index) => (
              <div
                key={criterion.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded">
                    Criterion {index + 1}
                  </span>
                  <button
                    onClick={() => removeCriterion(criterion.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Metric / What are you measuring?
                    </label>
                    <input
                      type="text"
                      value={criterion.metric}
                      onChange={(e) => updateCriterion(criterion.id, { metric: e.target.value })}
                      placeholder="e.g., Customer satisfaction score, Revenue growth, Time to market"
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Minimum Acceptable
                      </label>
                      <input
                        type="text"
                        value={criterion.minimum}
                        onChange={(e) => updateCriterion(criterion.id, { minimum: e.target.value })}
                        placeholder="e.g., 80% score, $50K MRR"
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Ideal Outcome
                      </label>
                      <input
                        type="text"
                        value={criterion.ideal}
                        onChange={(e) => updateCriterion(criterion.id, { ideal: e.target.value })}
                        placeholder="e.g., 95% score, $100K MRR"
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      How will you measure this?
                    </label>
                    <input
                      type="text"
                      value={criterion.measurementMethod}
                      onChange={(e) => updateCriterion(criterion.id, { measurementMethod: e.target.value })}
                      placeholder="e.g., Monthly NPS survey, CRM dashboard, Sprint velocity tracker"
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Helpful Tips */}
      <div className="bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-violet-900 dark:text-violet-100 mb-2">
          Tips for Good Success Criteria
        </h4>
        <ul className="text-xs text-violet-800 dark:text-violet-200 space-y-1">
          <li>• Make metrics quantifiable when possible (numbers, percentages, amounts)</li>
          <li>• Set realistic minimums - what&apos;s the lowest acceptable outcome?</li>
          <li>• Stretch for ideals - what would &quot;exceeds expectations&quot; look like?</li>
          <li>• Ensure you have a way to actually measure each criterion</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
        >
          Continue to Resources
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
