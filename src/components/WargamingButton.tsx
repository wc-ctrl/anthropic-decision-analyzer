'use client'

import React from 'react'
import { Swords, Loader2 } from 'lucide-react'

interface WargamingButtonProps {
  onOpenWargaming: () => void
  isGenerating: boolean
  hasAnalysis: boolean
  analysisType: 'decision' | 'forecast' | 'scenario' | 'strategy'
  disabled?: boolean
}

export function WargamingButton({
  onOpenWargaming,
  isGenerating,
  hasAnalysis,
  analysisType,
  disabled
}: WargamingButtonProps) {
  if (!hasAnalysis) {
    return null
  }

  const buttonText = 'Wargaming'

  const titleText = 'Interactive simulation: Explore how actors respond to different actions'

  return (
    <button
      onClick={onOpenWargaming}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title={titleText}
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Initializing Wargame...
        </>
      ) : (
        <>
          <Swords size={16} />
          {buttonText}
        </>
      )}
    </button>
  )
}
