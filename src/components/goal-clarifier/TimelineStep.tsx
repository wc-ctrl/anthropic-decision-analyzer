'use client'

import React, { useState } from 'react'
import { ArrowLeft, ArrowRight, Plus, Trash2, Calendar, Flag, AlertCircle } from 'lucide-react'
import { GoalDefinition, Milestone } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

interface TimelineStepProps {
  goal: Partial<GoalDefinition>
  onUpdateGoal: (updates: Partial<GoalDefinition>) => void
  onNext: () => void
  onBack: () => void
}

export function TimelineStep({ goal, onUpdateGoal, onNext, onBack }: TimelineStepProps) {
  const [newRisk, setNewRisk] = useState('')

  const timeline = goal.timeline || {
    deadline: '',
    milestones: [],
    bufferTime: '',
    riskToTimeline: []
  }

  const updateTimeline = (updates: Partial<GoalDefinition['timeline']>) => {
    onUpdateGoal({
      timeline: {
        ...timeline,
        ...updates
      }
    })
  }

  // Milestones
  const addMilestone = () => {
    const newMilestone: Milestone = {
      id: uuidv4(),
      description: '',
      targetDate: '',
      dependencies: [],
      isCheckpoint: false
    }
    updateTimeline({
      milestones: [...timeline.milestones, newMilestone]
    })
  }

  const updateMilestone = (id: string, updates: Partial<Milestone>) => {
    updateTimeline({
      milestones: timeline.milestones.map(m =>
        m.id === id ? { ...m, ...updates } : m
      )
    })
  }

  const removeMilestone = (id: string) => {
    updateTimeline({
      milestones: timeline.milestones.filter(m => m.id !== id)
    })
  }

  // Timeline Risks
  const addRisk = () => {
    if (newRisk.trim()) {
      updateTimeline({
        riskToTimeline: [...timeline.riskToTimeline, newRisk.trim()]
      })
      setNewRisk('')
    }
  }

  const removeRisk = (index: number) => {
    updateTimeline({
      riskToTimeline: timeline.riskToTimeline.filter((_, i) => i !== index)
    })
  }

  const canProceed = timeline.deadline?.trim()

  return (
    <div className="space-y-6">
      {/* Deadline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Calendar size={16} className="inline mr-2" />
          Target Deadline
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          When does this goal need to be achieved by?
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            value={timeline.deadline}
            onChange={(e) => updateTimeline({ deadline: e.target.value })}
            placeholder="e.g., Q2 2025, March 15, 2025, 6 months from now"
            className="flex-1 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Buffer Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Buffer Time
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          How much buffer have you built into your timeline for unexpected delays?
        </p>
        <input
          type="text"
          value={timeline.bufferTime}
          onChange={(e) => updateTimeline({ bufferTime: e.target.value })}
          placeholder="e.g., 2 weeks buffer, 10% contingency, no buffer"
          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Flag size={16} className="inline mr-2" />
            Key Milestones
          </label>
          <button
            onClick={addMilestone}
            className="flex items-center gap-1 px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-sm"
          >
            <Plus size={14} />
            Add Milestone
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          What are the key checkpoints along the way to your goal?
        </p>

        {timeline.milestones.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            No milestones defined. Breaking your goal into milestones helps track progress.
          </p>
        ) : (
          <div className="space-y-3">
            {timeline.milestones.map((milestone, index) => (
              <div
                key={milestone.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-2 py-0.5 rounded">
                        M{index + 1}
                      </span>
                      <input
                        type="text"
                        value={milestone.description}
                        onChange={(e) => updateMilestone(milestone.id, { description: e.target.value })}
                        placeholder="Milestone description"
                        className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={milestone.targetDate}
                        onChange={(e) => updateMilestone(milestone.id, { targetDate: e.target.value })}
                        placeholder="Target date"
                        className="w-40 p-2 border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm"
                      />
                      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <input
                          type="checkbox"
                          checked={milestone.isCheckpoint}
                          onChange={(e) => updateMilestone(milestone.id, { isCheckpoint: e.target.checked })}
                          className="rounded border-gray-300 dark:border-gray-600 text-violet-600 focus:ring-violet-500"
                        />
                        Review checkpoint
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMilestone(milestone.id)}
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

      {/* Timeline Risks */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <AlertCircle size={16} className="inline mr-2 text-orange-500" />
          Risks to Timeline
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          What could cause delays or push back your deadline?
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newRisk}
            onChange={(e) => setNewRisk(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRisk()}
            placeholder="Add risk to timeline..."
            className="flex-1 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
          />
          <button
            onClick={addRisk}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <Plus size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        {timeline.riskToTimeline.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {timeline.riskToTimeline.map((risk, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm"
              >
                {risk}
                <button
                  onClick={() => removeRisk(index)}
                  className="p-0.5 hover:bg-orange-200 dark:hover:bg-orange-800/50 rounded-full transition-colors"
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
          disabled={!canProceed}
          className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
        >
          Continue to Review
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
