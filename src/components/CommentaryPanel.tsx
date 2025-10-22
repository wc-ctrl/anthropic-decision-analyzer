'use client'

import React from 'react'
import { Commentary, AnalysisMode } from '@/types/decision'
import { MessageCircle, Clock, Edit, Plus, Trash } from 'lucide-react'

interface CommentaryPanelProps {
  commentary: Commentary[]
  mode: AnalysisMode
}

export function CommentaryPanel({ commentary, mode }: CommentaryPanelProps) {
  const getActionIcon = (triggeredBy: Commentary['triggeredBy']) => {
    switch (triggeredBy) {
      case 'nodeEdit':
        return <Edit size={16} className="text-blue-500" />
      case 'nodeAdd':
        return <Plus size={16} className="text-green-500" />
      case 'nodeDelete':
        return <Trash size={16} className="text-red-500" />
      default:
        return <MessageCircle size={16} className="text-gray-500" />
    }
  }

  const getActionLabel = (triggeredBy: Commentary['triggeredBy']) => {
    switch (triggeredBy) {
      case 'nodeEdit':
        return 'Node Updated'
      case 'nodeAdd':
        return 'Node Added'
      case 'nodeDelete':
        return 'Node Removed'
      default:
        return 'Analysis Generated'
    }
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Live Commentary
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {mode.type === 'decision'
            ? 'Real-time analysis of decision consequences and their relationships'
            : mode.type === 'forecast'
            ? 'Dynamic exploration of causal pathways and their implications'
            : 'Probability-based scenario planning with signpost indicators'
          }
        </p>
      </div>

      {/* Commentary Feed */}
      <div className="flex-1 overflow-y-auto">
        {commentary.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">
              Commentary will appear here as you interact with the decision tree
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {commentary.map((comment) => (
              <div
                key={comment.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getActionIcon(comment.triggeredBy)}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {getActionLabel(comment.triggeredBy)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    {formatTime(comment.timestamp)}
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  {comment.content.split('\n').map((line, index) => {
                    const trimmedLine = line.trim()

                    // Handle different formatting
                    if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                      // Bold headers like **BLUF:** or **KEY IMPLICATIONS:**
                      const headerText = trimmedLine.replace(/\*\*/g, '')
                      return (
                        <h4 key={index} className="font-semibold text-gray-900 dark:text-white mt-4 mb-2 first:mt-0">
                          {headerText}
                        </h4>
                      )
                    } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                      // Bullet points
                      return (
                        <div key={index} className="flex items-start gap-2 mb-1">
                          <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1">
                            {trimmedLine.replace(/^[•-]\s*/, '')}
                          </p>
                        </div>
                      )
                    } else if (trimmedLine.length > 0) {
                      // Regular paragraphs
                      return (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                          {trimmedLine}
                        </p>
                      )
                    }
                    return null
                  }).filter(Boolean)}
                </div>

                {/* Related Nodes Indicator */}
                {comment.relatedNodes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Analyzing {comment.relatedNodes.length} node{comment.relatedNodes.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Commentary updates automatically as you modify the decision tree
        </p>
      </div>
    </div>
  )
}