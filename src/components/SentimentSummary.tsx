'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { DecisionNode } from '@/types/decision'

interface SentimentSummaryProps {
  nodes: DecisionNode[]
  analysisType: 'decision' | 'forecast' | 'scenario'
}

export function SentimentSummary({ nodes, analysisType }: SentimentSummaryProps) {
  // Only count non-root nodes for sentiment analysis
  const analysisNodes = nodes.filter(n => n.data.order > 0)

  const sentimentCounts = {
    positive: analysisNodes.filter(n => n.data.sentiment === 'positive').length,
    negative: analysisNodes.filter(n => n.data.sentiment === 'negative').length,
    neutral: analysisNodes.filter(n => n.data.sentiment === 'neutral').length
  }

  const total = sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral

  if (total === 0) return null

  const getAnalysisLabel = () => {
    switch (analysisType) {
      case 'decision': return 'Consequences'
      case 'forecast': return 'Causal Factors'
      case 'scenario': return 'Indicators'
      default: return 'Factors'
    }
  }

  const getOverallSentiment = () => {
    const positiveRatio = sentimentCounts.positive / total
    const negativeRatio = sentimentCounts.negative / total

    if (positiveRatio > 0.6) return { label: 'Mostly Positive', color: 'text-green-600 dark:text-green-400' }
    if (negativeRatio > 0.6) return { label: 'Mostly Negative', color: 'text-red-600 dark:text-red-400' }
    if (positiveRatio > negativeRatio) return { label: 'Leaning Positive', color: 'text-green-500 dark:text-green-300' }
    if (negativeRatio > positiveRatio) return { label: 'Leaning Negative', color: 'text-red-500 dark:text-red-300' }
    return { label: 'Balanced', color: 'text-gray-600 dark:text-gray-400' }
  }

  const overall = getOverallSentiment()

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          {getAnalysisLabel()} Sentiment Analysis
        </h3>
        <span className={`text-sm font-medium ${overall.color}`}>
          {overall.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm">
        {/* Positive */}
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-green-500 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400 font-medium">
            {sentimentCounts.positive}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-xs">
            positive
          </span>
        </div>

        {/* Neutral */}
        <div className="flex items-center gap-2">
          <Minus size={16} className="text-gray-500 dark:text-gray-400" />
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            {sentimentCounts.neutral}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-xs">
            neutral
          </span>
        </div>

        {/* Negative */}
        <div className="flex items-center gap-2">
          <TrendingDown size={16} className="text-red-500 dark:text-red-400" />
          <span className="text-red-600 dark:text-red-400 font-medium">
            {sentimentCounts.negative}
          </span>
          <span className="text-gray-600 dark:text-gray-400 text-xs">
            negative
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-3">
        <div className="flex h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          <div
            className="bg-green-500 dark:bg-green-400"
            style={{ width: `${(sentimentCounts.positive / total) * 100}%` }}
          />
          <div
            className="bg-gray-400 dark:bg-gray-500"
            style={{ width: `${(sentimentCounts.neutral / total) * 100}%` }}
          />
          <div
            className="bg-red-500 dark:bg-red-400"
            style={{ width: `${(sentimentCounts.negative / total) * 100}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral} total {getAnalysisLabel().toLowerCase()}
        </div>
      </div>
    </div>
  )
}