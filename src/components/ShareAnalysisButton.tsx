'use client'

import React from 'react'
import { Share, Loader2, MessageCircle } from 'lucide-react'

interface ShareAnalysisButtonProps {
  onShare: () => void
  isSharing: boolean
  hasAnalysis: boolean
  analysisType: 'decision' | 'forecast' | 'scenario'
  disabled?: boolean
  hasDocuments: boolean
}

export function ShareAnalysisButton({
  onShare,
  isSharing,
  hasAnalysis,
  analysisType,
  disabled,
  hasDocuments
}: ShareAnalysisButtonProps) {
  // Hide share button - Slack integration removed
  // This could be repurposed for exporting/sharing in other ways
  if (!hasAnalysis) {
    return null
  }

  return (
    <button
      onClick={onShare}
      disabled={disabled || isSharing}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title="Share quick assessment"
    >
      {isSharing ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Sharing...
        </>
      ) : (
        <>
          <Share size={16} />
          Share
        </>
      )}
    </button>
  )
}
