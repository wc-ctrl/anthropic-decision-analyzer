'use client'

import React from 'react'
import { Target, Loader2 } from 'lucide-react'

interface ScenarioButtonProps {
  onOpenScenario: () => void
  isGenerating: boolean
  hasAnalysis: boolean
  disabled?: boolean
}

export function ScenarioButton({
  onOpenScenario,
  isGenerating,
  hasAnalysis,
  disabled
}: ScenarioButtonProps) {
  if (!hasAnalysis) {
    return null // Hide button when no analysis exists
  }

  return (
    <button
      onClick={onOpenScenario}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-600 dark:to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-700 dark:hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
      title="Generate probability scenarios with signpost analysis"
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating Scenarios...
        </>
      ) : (
        <>
          <Target size={16} />
          Scenario Analysis
        </>
      )}
    </button>
  )
}