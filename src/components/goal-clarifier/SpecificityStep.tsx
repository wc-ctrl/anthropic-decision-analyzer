'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, Users } from 'lucide-react'
import { GoalDefinition, Stakeholder } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

interface SpecificityStepProps {
  goal: Partial<GoalDefinition>
  onUpdateGoal: (updates: Partial<GoalDefinition>) => void
  onNext: () => void
  onBack: () => void
}

const INFLUENCE_OPTIONS: Stakeholder['influence'][] = ['low', 'medium', 'high']
const INTEREST_OPTIONS: Stakeholder['interest'][] = ['low', 'medium', 'high']
const DISPOSITION_OPTIONS: Stakeholder['disposition'][] = ['supporter', 'neutral', 'skeptic', 'opponent']

export function SpecificityStep({ goal, onUpdateGoal, onNext, onBack }: SpecificityStepProps) {
  const [newOutOfScope, setNewOutOfScope] = useState('')

  const specificity = goal.specificity || {
    concreteOutcome: '',
    stakeholders: [],
    scope: '',
    outOfScope: []
  }

  const updateSpecificity = (updates: Partial<GoalDefinition['specificity']>) => {
    onUpdateGoal({
      specificity: {
        ...specificity,
        ...updates
      }
    })
  }

  const addStakeholder = () => {
    const newStakeholder: Stakeholder = {
      id: uuidv4(),
      name: '',
      role: '',
      influence: 'medium',
      interest: 'medium',
      disposition: 'neutral'
    }
    updateSpecificity({
      stakeholders: [...specificity.stakeholders, newStakeholder]
    })
  }

  const updateStakeholder = (id: string, updates: Partial<Stakeholder>) => {
    updateSpecificity({
      stakeholders: specificity.stakeholders.map(s =>
        s.id === id ? { ...s, ...updates } : s
      )
    })
  }

  const removeStakeholder = (id: string) => {
    updateSpecificity({
      stakeholders: specificity.stakeholders.filter(s => s.id !== id)
    })
  }

  const addOutOfScope = () => {
    if (newOutOfScope.trim()) {
      updateSpecificity({
        outOfScope: [...specificity.outOfScope, newOutOfScope.trim()]
      })
      setNewOutOfScope('')
    }
  }

  const removeOutOfScope = (index: number) => {
    updateSpecificity({
      outOfScope: specificity.outOfScope.filter((_, i) => i !== index)
    })
  }

  const canProceed = specificity.concreteOutcome?.trim() && specificity.scope?.trim()

  return (
    <div className="space-y-6">
      {/* Concrete Outcome */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Concrete Outcome
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          What does success look like? Describe the specific, tangible result you want to achieve.
        </p>
        <textarea
          value={specificity.concreteOutcome}
          onChange={(e) => updateSpecificity({ concreteOutcome: e.target.value })}
          placeholder="e.g., 'Increase monthly recurring revenue from $50K to $100K while maintaining current customer satisfaction scores'"
          className="w-full h-24 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Scope */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Scope
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          What&apos;s included in this goal? Define the boundaries of what you&apos;re trying to accomplish.
        </p>
        <textarea
          value={specificity.scope}
          onChange={(e) => updateSpecificity({ scope: e.target.value })}
          placeholder="e.g., 'This includes all B2B customers in North America, focusing on enterprise tier accounts with annual contracts'"
          className="w-full h-20 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Out of Scope */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Out of Scope
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          What&apos;s explicitly NOT part of this goal? Defining boundaries helps maintain focus.
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newOutOfScope}
            onChange={(e) => setNewOutOfScope(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addOutOfScope()}
            placeholder="Add item..."
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
          <button
            onClick={addOutOfScope}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        {specificity.outOfScope.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {specificity.outOfScope.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {item}
                <button
                  onClick={() => removeOutOfScope(index)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stakeholders */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Users size={16} className="inline mr-2" />
            Key Stakeholders
          </label>
          <button
            onClick={addStakeholder}
            className="flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Stakeholder
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Who are the key people or groups affected by or involved in this goal?
        </p>

        {specificity.stakeholders.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            No stakeholders added yet. Click &quot;Add Stakeholder&quot; to identify key people or groups.
          </p>
        ) : (
          <div className="space-y-3">
            {specificity.stakeholders.map((stakeholder) => (
              <div
                key={stakeholder.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={stakeholder.name}
                      onChange={(e) => updateStakeholder(stakeholder.id, { name: e.target.value })}
                      placeholder="Name/Title"
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                    <input
                      type="text"
                      value={stakeholder.role}
                      onChange={(e) => updateStakeholder(stakeholder.id, { role: e.target.value })}
                      placeholder="Role/Relationship"
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeStakeholder(stakeholder.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Influence</label>
                    <select
                      value={stakeholder.influence}
                      onChange={(e) => updateStakeholder(stakeholder.id, { influence: e.target.value as Stakeholder['influence'] })}
                      className="w-full p-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      {INFLUENCE_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Interest</label>
                    <select
                      value={stakeholder.interest}
                      onChange={(e) => updateStakeholder(stakeholder.id, { interest: e.target.value as Stakeholder['interest'] })}
                      className="w-full p-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      {INTEREST_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Disposition</label>
                    <select
                      value={stakeholder.disposition}
                      onChange={(e) => updateStakeholder(stakeholder.id, { disposition: e.target.value as Stakeholder['disposition'] })}
                      className="w-full p-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    >
                      {DISPOSITION_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
          Continue to Success Criteria
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
