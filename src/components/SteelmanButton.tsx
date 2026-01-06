'use client'

import React from 'react'
import { Shield, TrendingUp, Loader2 } from 'lucide-react'

interface SteelmanButtonProps {
  onOpenSteelman: () => void
  isGenerating: boolean
  hasAnalysis: boolean
  analysisType: 'decision' | 'forecast' | 'scenario' | 'strategy'
  disabled?: boolean
}

export function SteelmanButton({
  onOpenSteelman,
  isGenerating,
  hasAnalysis,
  analysisType,
  disabled
}: SteelmanButtonProps) {
  if (!hasAnalysis) {
    return null
  }

  const buttonText = analysisType === 'decision'
    ? 'Steelman Case'
    : analysisType === 'forecast'
    ? 'Success Factors'
    : 'Best Case Analysis'

  const loadingText = analysisType === 'decision'
    ? 'Building Strongest Case...'
    : analysisType === 'forecast'
    ? 'Analyzing Success Factors...'
    : 'Generating Best Case...'

  const buttonIcon = analysisType === 'decision'
    ? <Shield size={16} />
    : <TrendingUp size={16} />

  const titleText = analysisType === 'decision'
    ? 'Generate strongest arguments in favor of this decision'
    : analysisType === 'forecast'
    ? 'Analyze factors that would enable this outcome'
    : 'Explore the best-case scenario'

  return (
    <button
      onClick={onOpenSteelman}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
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
