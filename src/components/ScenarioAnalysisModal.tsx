'use client'

import React from 'react'
import { X, Target, Clock, TrendingUp, TrendingDown } from 'lucide-react'
import { ScenarioAnalysis, ScenarioTrack } from '@/types/decision'

interface ScenarioAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  data: ScenarioAnalysis | null
  loading: boolean
}

export function ScenarioAnalysisModal({
  isOpen,
  onClose,
  data,
  loading
}: ScenarioAnalysisModalProps) {
  if (!isOpen) return null

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-500 text-white'
    if (probability >= 60) return 'bg-blue-500 text-white'
    if (probability >= 40) return 'bg-yellow-500 text-black'
    if (probability >= 20) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  const getTierColor = (tier: number) => {
    const colors = [
      'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
      'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
      'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
      'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700',
      'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
    ]
    return colors[tier - 1] || colors[0]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center gap-3">
            <Target size={24} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Scenario Analysis: Probability Tracks
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
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Generating probability scenarios and signpost analysis...
                </p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Target Outcome */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Target size={18} />
                  Target Outcome
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-lg">
                  {data.targetOutcome}
                </p>
              </div>

              {/* Scenario Tracks Grid */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Probability Scenario Tracks
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  {data.tracks.map((track, trackIndex) => (
                    <div
                      key={trackIndex}
                      className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 shadow-sm"
                    >
                      {/* Track Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {track.label}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${getProbabilityColor(track.probability)}`}>
                          {track.probability}%
                        </span>
                      </div>

                      {/* Track Description */}
                      <p className="text-xs text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {track.description}
                      </p>

                      {/* Signposts */}
                      <div className="space-y-2">
                        <h5 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                          Key Signposts
                        </h5>
                        {track.signposts.map((signpost, signpostIndex) => (
                          <div
                            key={signpostIndex}
                            className={`border rounded-lg p-2 ${getTierColor(signpost.tier)}`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                                Tier {signpost.tier}
                              </span>
                              <div className="flex items-center gap-1">
                                <Clock size={10} className="text-gray-500" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {signpost.timeframe}
                                </span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                              {signpost.text}
                            </p>
                            <div className="mt-1">
                              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                                {signpost.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Uncertainties */}
              {data.keyUncertainties && data.keyUncertainties.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Critical Uncertainties to Monitor
                  </h3>
                  <ul className="space-y-2">
                    {data.keyUncertainties.map((uncertainty, index) => (
                      <li key={index} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-yellow-500 font-bold mt-1">⚠</span>
                        {uncertainty}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Methodology */}
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Forecasting Methodology
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                  {data.methodology}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Target size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Failed to generate scenario analysis
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Probability-based forecasting • Signpost methodology • Strategic intelligence
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Close Scenarios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}