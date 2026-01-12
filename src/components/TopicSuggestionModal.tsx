'use client'

import React, { useState } from 'react'
import { X, Lightbulb, Copy, CheckCircle, GitBranch, TrendingUp, Target } from 'lucide-react'

interface TopicSuggestion {
  id: string
  type: 'decision' | 'forecast' | 'scenario'
  title: string
  text: string
  context: string
  relevanceScore: number
}

interface TopicSuggestionsData {
  suggestions: TopicSuggestion[]
  userContext: {
    recentTopics: string[]
    interests: string[]
    slackActivity: string[]
  }
  analysisRationale: string
}

interface TopicSuggestionModalProps {
  isOpen: boolean
  onClose: () => void
  data: TopicSuggestionsData | null
  loading: boolean
  onSelectTopic: (type: 'decision' | 'forecast' | 'scenario', text: string) => void
}

export function TopicSuggestionModal({
  isOpen,
  onClose,
  data,
  loading,
  onSelectTopic
}: TopicSuggestionModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!isOpen) return null

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'decision': return <GitBranch size={16} className="text-blue-500" />
      case 'forecast': return <TrendingUp size={16} className="text-green-500" />
      case 'scenario': return <Target size={16} className="text-purple-500" />
      default: return <Lightbulb size={16} className="text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'decision': return 'Decision Analysis'
      case 'forecast': return 'Causal Analysis'
      case 'scenario': return 'Scenario Analysis'
      default: return 'Analysis'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'decision': return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
      case 'forecast': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
      case 'scenario': return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700'
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-700'
    }
  }

  const handleCopyText = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleSelectAndClose = (type: 'decision' | 'forecast' | 'scenario', text: string) => {
    onSelectTopic(type, text)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <div className="flex items-center gap-3">
            <Lightbulb size={24} className="text-yellow-600 dark:text-yellow-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              AI-Powered Topic Suggestions
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyzing your Slack history and interests...
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Generating personalized strategic analysis suggestions
                </p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* User Context Summary */}
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-3">
                  Personalized Suggestions Based On Your Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Recent Slack Topics</h4>
                    <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                      {data.userContext.recentTopics.slice(0, 3).map((topic, index) => (
                        <li key={index} className="text-xs">• {topic}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Your Interests</h4>
                    <ul className="space-y-1 text-yellow-700 dark:text-yellow-300">
                      {data.userContext.interests.slice(0, 3).map((interest, index) => (
                        <li key={index} className="text-xs">• {interest}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Analysis Rationale</h4>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 leading-relaxed">
                      {data.analysisRationale}
                    </p>
                  </div>
                </div>
              </div>

              {/* Suggested Topics */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Suggested Strategic Analysis Topics
                </h3>

                <div className="space-y-4">
                  {data.suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 ${getTypeColor(suggestion.type)}`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(suggestion.type)}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {getTypeLabel(suggestion.type)}
                          </span>
                          <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                            {suggestion.relevanceScore}% relevance
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCopyText(suggestion.text, suggestion.id)}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            {copiedId === suggestion.id ? (
                              <CheckCircle size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} className="text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        {suggestion.title}
                      </h4>

                      <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-3 mb-3 font-mono text-sm">
                        <p className="text-gray-800 dark:text-gray-200">
                          {suggestion.text}
                        </p>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <strong>Context:</strong> {suggestion.context}
                      </p>

                      {/* Action Button */}
                      <button
                        onClick={() => handleSelectAndClose(suggestion.type, suggestion.text)}
                        className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                          suggestion.type === 'decision'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : suggestion.type === 'forecast'
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                        }`}
                      >
                        🚀 Start Analysis Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb size={48} className="text-yellow-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Unable to generate topic suggestions
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Please ensure Slack is connected and try again
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI-powered suggestions • Slack history analysis • Personal interest profiling
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close Suggestions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}