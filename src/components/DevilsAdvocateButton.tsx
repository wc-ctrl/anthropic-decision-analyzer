'use client'

import React from 'react'
import { AlertTriangle, TrendingDown, Loader2 } from 'lucide-react'

interface DevilsAdvocateButtonProps {
  onOpenDevilsAdvocate: () => void
  isGenerating: boolean
  hasAnalysis: boolean
  analysisType: 'decision' | 'forecast'
  disabled?: boolean
}

export function DevilsAdvocateButton({
  onOpenDevilsAdvocate,
  isGenerating,
  hasAnalysis,
  analysisType,
  disabled
}: DevilsAdvocateButtonProps) {
  if (!hasAnalysis) {
    return null // Hide button when no analysis exists
  }

  const buttonText = analysisType === 'decision'
    ? 'Devil\'s Advocate'
    : 'Prevention Analysis'

  const loadingText = analysisType === 'decision'
    ? 'Generating Counterarguments...'
    : 'Analyzing Prevention Factors...'

  const buttonIcon = analysisType === 'decision'
    ? <AlertTriangle size={16} />
    : <TrendingDown size={16} />

  const titleText = analysisType === 'decision'
    ? 'Generate strongest arguments against this decision'
    : 'Analyze factors that could prevent this outcome'

  return (
    <button
      onClick={onOpenDevilsAdvocate}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title={titleText}
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          {buttonIcon}
          {buttonText}
        </>
      )}
    </button>
  )
}