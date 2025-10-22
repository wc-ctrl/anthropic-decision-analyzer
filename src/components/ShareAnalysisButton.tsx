'use client'

import React from 'react'
import { Share, Loader2, MessageCircle } from 'lucide-react'

interface ShareAnalysisButtonProps {
  onShare: () => void
  isSharing: boolean
  hasAnalysis: boolean
  analysisType: 'decision' | 'forecast' | 'scenario'
  disabled?: boolean
  slackConnected: boolean
}

export function ShareAnalysisButton({
  onShare,
  isSharing,
  hasAnalysis,
  analysisType,
  disabled,
  slackConnected
}: ShareAnalysisButtonProps) {
  if (!hasAnalysis || !slackConnected) {
    return null // Hide button when no analysis or Slack not connected
  }

  const getButtonText = () => {
    switch (analysisType) {
      case 'decision':
        return 'Share Decision Tree'
      case 'forecast':
        return 'Share Causal Analysis'
      case 'scenario':
        return 'Share Scenarios'
      default:
        return 'Share Analysis'
    }
  }

  const getLoadingText = () => {
    switch (analysisType) {
      case 'decision':
        return 'Sharing Decision Tree...'
      case 'forecast':
        return 'Sharing Causal Analysis...'
      case 'scenario':
        return 'Sharing Scenarios...'
      default:
        return 'Sharing Analysis...'
    }
  }

  return (
    <button
      onClick={onShare}
      disabled={disabled || isSharing || !slackConnected}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title={`Share ${analysisType} analysis to #mission-lab-chatter Slack channel`}
    >
      {isSharing ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          {getLoadingText()}
        </>
      ) : (
        <>
          <MessageCircle size={16} />
          {getButtonText()}
        </>
      )}
    </button>
  )
}