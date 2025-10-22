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
      <div className="p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Live Commentary
        </h2>
        <p className="text-sm text-gray-600">
          {mode.type === 'decision'
            ? 'Real-time analysis of decision consequences and their relationships'
            : 'Dynamic exploration of causal pathways and their implications'
          }
        </p>
      </div>

      {/* Commentary Feed */}
      <div className="flex-1 overflow-y-auto">
        {commentary.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">
              Commentary will appear here as you interact with the decision tree
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {commentary.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getActionIcon(comment.triggeredBy)}
                    <span className="text-sm font-medium text-gray-700">
                      {getActionLabel(comment.triggeredBy)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    {formatTime(comment.timestamp)}
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none">
                  {comment.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-sm text-gray-700 leading-relaxed mb-3 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Related Nodes Indicator */}
                {comment.relatedNodes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
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
      <div className="p-3 border-t bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          Commentary updates automatically as you modify the decision tree
        </p>
      </div>
    </div>
  )
}