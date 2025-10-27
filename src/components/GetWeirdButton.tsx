'use client'

import React from 'react'
import { Zap, Loader2, Brain } from 'lucide-react'

interface GetWeirdButtonProps {
  onGetWeird: () => void
  isGenerating: boolean
  hasAnalysis: boolean
  disabled?: boolean
}

export function GetWeirdButton({
  onGetWeird,
  isGenerating,
  hasAnalysis,
  disabled
}: GetWeirdButtonProps) {
  if (!hasAnalysis) {
    return null // Hide button when no analysis exists
  }

  return (
    <button
      onClick={onGetWeird}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-600 dark:to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 dark:hover:from-purple-700 dark:hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed transition-all shadow-lg"
      title="Generate unconventional but plausible insights using cognitive intuition pumps"
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Getting Weird...
        </>
      ) : (
        <>
          <Brain size={16} />
          Get Weird
        </>
      )}
    </button>
  )
}