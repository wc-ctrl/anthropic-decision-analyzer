'use client'

import React, { useState } from 'react'
import { X, MessageSquare, Check, Loader2, ExternalLink } from 'lucide-react'

export interface SlackSuggestion {
  id: string
  channel: string
  text: string
  user: string
  timestamp: string
  permalink?: string
}

interface SlackContextSuggestionsProps {
  suggestions: SlackSuggestion[]
  loading: boolean
  onConfirm: (selected: SlackSuggestion[]) => void
  onSkip: () => void
}

export function SlackContextSuggestions({
  suggestions,
  loading,
  onConfirm,
  onSkip
}: SlackContextSuggestionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(suggestions.map(s => s.id)) // All selected by default
  )

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleConfirm = () => {
    const selected = suggestions.filter(s => selectedIds.has(s.id))
    onConfirm(selected)
  }

  const formatTimestamp = (ts: string) => {
    try {
      // Slack timestamp format: "1234567890.123456"
      const date = new Date(parseFloat(ts) * 1000)
      const now = new Date()
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return 'Today'
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  if (loading) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <Loader2 size={20} className="animate-spin text-blue-600" />
          <span className="text-sm text-blue-800 dark:text-blue-200">
            Searching Slack for relevant context...
          </span>
        </div>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden mb-4">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            Relevant Slack Context Found
          </span>
          <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
            {suggestions.length} thread{suggestions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <button
          onClick={onSkip}
          className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded"
          title="Skip Slack context"
        >
          <X size={18} className="text-blue-600 dark:text-blue-400" />
        </button>
      </div>

      {/* Suggestions list */}
      <div className="max-h-64 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            onClick={() => toggleSelection(suggestion.id)}
            className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-blue-100 dark:border-blue-800/50 last:border-b-0 ${
              selectedIds.has(suggestion.id)
                ? 'bg-blue-100 dark:bg-blue-800/30'
                : 'hover:bg-blue-100/50 dark:hover:bg-blue-800/20'
            }`}
          >
            {/* Checkbox */}
            <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
              selectedIds.has(suggestion.id)
                ? 'bg-blue-600 border-blue-600'
                : 'border-blue-400 dark:border-blue-600'
            }`}>
              {selectedIds.has(suggestion.id) && (
                <Check size={14} className="text-white" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                  #{suggestion.channel}
                </span>
                <span className="text-xs text-blue-600 dark:text-blue-400">
                  @{suggestion.user}
                </span>
                <span className="text-xs text-blue-500 dark:text-blue-500">
                  {formatTimestamp(suggestion.timestamp)}
                </span>
                {suggestion.permalink && (
                  <a
                    href={suggestion.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                {truncateText(suggestion.text)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-blue-200 dark:border-blue-800 bg-blue-100/50 dark:bg-blue-800/20">
        <span className="text-xs text-blue-700 dark:text-blue-300">
          {selectedIds.size} of {suggestions.length} selected
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="px-3 py-1.5 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIds.size === 0}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
          >
            <Check size={14} />
            Include {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} in Analysis
          </button>
        </div>
      </div>
    </div>
  )
}
