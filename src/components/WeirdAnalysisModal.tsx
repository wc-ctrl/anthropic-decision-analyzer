'use client'

import React from 'react'
import { X, Brain, Plus, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

interface WeirdNode {
  id: string
  data: {
    label: string
    description: string
    order: number
    nodeType: string
    sentiment: string
    probability: number
    isWeird: true
  }
  mechanism: string
  diagnosticSignals: string[]
  whyOverlooked: string
  intuitionPump: string
}

interface WeirdAnalysisData {
  weirdNodes: WeirdNode[]
  weirdnessRationale: string
  diagnosticValue: string
  probabilityJustification: string
}

interface WeirdAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onAddWeirdNodes: (nodes: WeirdNode[]) => void
  data: WeirdAnalysisData | null
  loading: boolean
  analysisType: 'decision' | 'forecast' | 'scenario'
}

export function WeirdAnalysisModal({
  isOpen,
  onClose,
  onAddWeirdNodes,
  data,
  loading,
  analysisType
}: WeirdAnalysisModalProps) {
  if (!isOpen) return null

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp size={16} className="text-green-500" />
      case 'negative': return <TrendingDown size={16} className="text-red-500" />
      default: return <AlertTriangle size={16} className="text-yellow-500" />
    }
  }

  const getAnalysisLabel = () => {
    switch (analysisType) {
      case 'decision': return 'Weird Consequences'
      case 'forecast': return 'Weird Causal Factors'
      case 'scenario': return 'Weird Scenario Elements'
      default: return 'Weird Analysis'
    }
  }

  const handleAddAllWeirdNodes = () => {
    if (data?.weirdNodes) {
      onAddWeirdNodes(data.weirdNodes)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center gap-3">
            <Brain size={24} className="text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {getAnalysisLabel()}: Unconventional Insights
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Applying cognitive intuition pumps...
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  Surfacing overlooked possibilities and diagnostic signals
                </p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Weirdness Overview */}
              <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Unconventional Analysis Rationale
                </h3>
                <p className="text-purple-800 dark:text-purple-200 text-sm leading-relaxed mb-3">
                  {data.weirdnessRationale}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Diagnostic Value:</h4>
                    <p className="text-purple-700 dark:text-purple-300">{data.diagnosticValue}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Why Consider Low Probability:</h4>
                    <p className="text-purple-700 dark:text-purple-300">{data.probabilityJustification}</p>
                  </div>
                </div>
              </div>

              {/* Weird Nodes */}
              <div className="space-y-4">
                {data.weirdNodes.map((node, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-200 dark:border-purple-700 rounded-lg p-4"
                  >
                    {/* Node Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(node.data.sentiment)}
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {node.data.label}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 px-2 py-1 rounded font-medium">
                          {node.data.probability}% probability
                        </span>
                        <span className="text-xs bg-pink-200 dark:bg-pink-800 text-pink-800 dark:text-pink-200 px-2 py-1 rounded font-medium">
                          WEIRD
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      {node.data.description}
                    </p>

                    {/* Mechanism */}
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Mechanism:
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        {node.mechanism}
                      </p>
                    </div>

                    {/* Diagnostic Signals */}
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Early Warning Signals:
                      </h5>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                        {node.diagnosticSignals.map((signal, signalIndex) => (
                          <li key={signalIndex} className="flex items-start gap-1">
                            <span className="text-yellow-500 mt-1">⚠</span>
                            {signal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Why Overlooked */}
                    <div className="mb-3">
                      <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Why Usually Overlooked:
                      </h5>
                      <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                        {node.whyOverlooked}
                      </p>
                    </div>

                    {/* Intuition Pump */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded p-2">
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        💡 Intuition Pump: {node.intuitionPump}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Brain size={48} className="text-purple-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Failed to generate weird analysis
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cognitive intuition pumps • Unconventional thinking • Diagnostic signals
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
              {data && data.weirdNodes.length > 0 && (
                <button
                  onClick={handleAddAllWeirdNodes}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={16} />
                  Add to Tree
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}