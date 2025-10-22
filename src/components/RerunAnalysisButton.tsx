'use client'

import React from 'react'
import { RotateCcw, Loader2 } from 'lucide-react'

interface RerunAnalysisButtonProps {
  onRerun: () => void
  isGenerating: boolean
  hasAnalysis: boolean
  analysisType: 'decision' | 'forecast'
  disabled?: boolean
}

export function RerunAnalysisButton({
  onRerun,
  isGenerating,
  hasAnalysis,
  analysisType,
  disabled
}: RerunAnalysisButtonProps) {
  if (!hasAnalysis) {
    return null // Hide button when no analysis exists to rerun
  }

  const buttonText = analysisType === 'decision'
    ? 'Rerun Decision Analysis'
    : 'Rerun Causal Analysis'

  const loadingText = analysisType === 'decision'
    ? 'Regenerating Consequences...'
    : 'Regenerating Causes...'

  return (
    <button
      onClick={onRerun}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title={`Generate fresh ${analysisType === 'decision' ? 'consequences' : 'causal factors'} with the same input`}
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <RotateCcw size={16} />
          {buttonText}
        </>
      )}
    </button>
  )
}