'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, DollarSign, Users, Clock, Cpu, Building, AlertTriangle } from 'lucide-react'
import { GoalDefinition, ResourceConstraint, Blocker } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

interface ConstraintsStepProps {
  goal: Partial<GoalDefinition>
  onUpdateGoal: (updates: Partial<GoalDefinition>) => void
  onNext: () => void
  onBack: () => void
}

const RESOURCE_TYPES: { value: ResourceConstraint['type']; label: string; icon: React.ReactNode }[] = [
  { value: 'budget', label: 'Budget', icon: <DollarSign size={14} /> },
  { value: 'people', label: 'People', icon: <Users size={14} /> },
  { value: 'time', label: 'Time', icon: <Clock size={14} /> },
  { value: 'technology', label: 'Technology', icon: <Cpu size={14} /> },
  { value: 'political_capital', label: 'Political Capital', icon: <Building size={14} /> },
  { value: 'other', label: 'Other', icon: null },
]

const FLEXIBILITY_OPTIONS: ResourceConstraint['flexibility'][] = ['fixed', 'somewhat_flexible', 'very_flexible']
const SEVERITY_OPTIONS: Blocker['severity'][] = ['low', 'medium', 'high', 'critical']

export function ConstraintsStep({ goal, onUpdateGoal, onNext, onBack }: ConstraintsStepProps) {
  const [newDependency, setNewDependency] = useState('')

  const resources = goal.resources || {
    constraints: [],
    blockers: [],
    dependencies: []
  }

  const updateResources = (updates: Partial<GoalDefinition['resources']>) => {
    onUpdateGoal({
      resources: {
        ...resources,
        ...updates
      }
    })
  }

  // Constraints
  const addConstraint = () => {
    const newConstraint: ResourceConstraint = {
      id: uuidv4(),
      type: 'budget',
      description: '',
      available: '',
      required: '',
      flexibility: 'somewhat_flexible'
    }
    updateResources({
      constraints: [...resources.constraints, newConstraint]
    })
  }

  const updateConstraint = (id: string, updates: Partial<ResourceConstraint>) => {
    updateResources({
      constraints: resources.constraints.map(c =>
        c.id === id ? { ...c, ...updates } : c
      )
    })
  }

  const removeConstraint = (id: string) => {
    updateResources({
      constraints: resources.constraints.filter(c => c.id !== id)
    })
  }

  // Blockers
  const addBlocker = () => {
    const newBlocker: Blocker = {
      id: uuidv4(),
      description: '',
      severity: 'medium',
      mitigation: ''
    }
    updateResources({
      blockers: [...resources.blockers, newBlocker]
    })
  }

  const updateBlocker = (id: string, updates: Partial<Blocker>) => {
    updateResources({
      blockers: resources.blockers.map(b =>
        b.id === id ? { ...b, ...updates } : b
      )
    })
  }

  const removeBlocker = (id: string) => {
    updateResources({
      blockers: resources.blockers.filter(b => b.id !== id)
    })
  }

  // Dependencies
  const addDependency = () => {
    if (newDependency.trim()) {
      updateResources({
        dependencies: [...resources.dependencies, newDependency.trim()]
      })
      setNewDependency('')
    }
  }

  const removeDependency = (index: number) => {
    updateResources({
      dependencies: resources.dependencies.filter((_, i) => i !== index)
    })
  }

  const getTypeIcon = (type: ResourceConstraint['type']) => {
    const found = RESOURCE_TYPES.find(t => t.value === type)
    return found?.icon || null
  }

  const getSeverityColor = (severity: Blocker['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-800'
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-800'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-800'
      case 'low': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Resource Constraints */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Resource Constraints
          </label>
          <button
            onClick={addConstraint}
            className="flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Constraint
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What resources do you have available, and what do you need?
        </p>

        {resources.constraints.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            No resource constraints defined. Click &quot;Add Constraint&quot; to specify budget, people, time, etc.
          </p>
        ) : (
          <div className="space-y-3">
            {resources.constraints.map((constraint) => (
              <div
                key={constraint.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={constraint.type}
                        onChange={(e) => updateConstraint(constraint.id, { type: e.target.value as ResourceConstraint['type'] })}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        {RESOURCE_TYPES.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={constraint.description}
                        onChange={(e) => updateConstraint(constraint.id, { description: e.target.value })}
                        placeholder="Description"
                        className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Available</label>
                        <input
                          type="text"
                          value={constraint.available}
                          onChange={(e) => updateConstraint(constraint.id, { available: e.target.value })}
                          placeholder="e.g., $50K"
                          className="w-full p-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Required</label>
                        <input
                          type="text"
                          value={constraint.required}
                          onChange={(e) => updateConstraint(constraint.id, { required: e.target.value })}
                          placeholder="e.g., $80K"
                          className="w-full p-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Flexibility</label>
                        <select
                          value={constraint.flexibility}
                          onChange={(e) => updateConstraint(constraint.id, { flexibility: e.target.value as ResourceConstraint['flexibility'] })}
                          className="w-full p-1.5 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          {FLEXIBILITY_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeConstraint(constraint.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blockers */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <AlertTriangle size={16} className="inline mr-2 text-yellow-500" />
            Potential Blockers
          </label>
          <button
            onClick={addBlocker}
            className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Blocker
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What obstacles or risks could prevent success?
        </p>

        {resources.blockers.length > 0 && (
          <div className="space-y-3">
            {resources.blockers.map((blocker) => (
              <div
                key={blocker.id}
                className={`border rounded-lg p-3 ${getSeverityColor(blocker.severity)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      <select
                        value={blocker.severity}
                        onChange={(e) => updateBlocker(blocker.id, { severity: e.target.value as Blocker['severity'] })}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                      >
                        {SEVERITY_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={blocker.description}
                        onChange={(e) => updateBlocker(blocker.id, { description: e.target.value })}
                        placeholder="Describe the blocker"
                        className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={blocker.mitigation || ''}
                      onChange={(e) => updateBlocker(blocker.id, { mitigation: e.target.value })}
                      placeholder="Mitigation strategy (optional)"
                      className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeBlocker(blocker.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dependencies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          External Dependencies
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          What external factors or approvals does this goal depend on?
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newDependency}
            onChange={(e) => setNewDependency(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addDependency()}
            placeholder="Add dependency..."
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
          <button
            onClick={addDependency}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        {resources.dependencies.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {resources.dependencies.map((dep, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
              >
                {dep}
                <button
                  onClick={() => removeDependency(index)}
                  className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </span>
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
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium"
        >
          Continue to Timeline
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
