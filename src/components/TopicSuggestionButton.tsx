'use client'

import React from 'react'
import { Lightbulb, Loader2 } from 'lucide-react'

interface TopicSuggestionButtonProps {
  onOpenSuggestions: () => void
  isGenerating: boolean
  hasDocuments: boolean
  disabled?: boolean
}

export function TopicSuggestionButton({
  onOpenSuggestions,
  isGenerating,
  hasDocuments,
  disabled
}: TopicSuggestionButtonProps) {
  return (
    <button
      onClick={onOpenSuggestions}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-600 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title={hasDocuments ? "Get AI-powered topic suggestions based on your documents" : "Get AI-powered topic suggestions"}
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating Ideas...
        </>
      ) : (
        <>
          <Lightbulb size={16} />
          Suggest Topics
        </>
      )}
    </button>
  )
}
