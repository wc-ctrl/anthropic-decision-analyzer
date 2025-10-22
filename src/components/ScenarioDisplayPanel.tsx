'use client'

import React from 'react'
import { Target, Clock, TrendingUp, AlertTriangle } from 'lucide-react'
import { ScenarioAnalysis } from '@/types/decision'

interface ScenarioDisplayPanelProps {
  data: ScenarioAnalysis | null
  loading: boolean
}

export function ScenarioDisplayPanel({ data, loading }: ScenarioDisplayPanelProps) {
  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'bg-green-500 text-white'
    if (probability >= 60) return 'bg-blue-500 text-white'
    if (probability >= 40) return 'bg-yellow-500 text-black'
    if (probability >= 20) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  const getTierColor = (tier: number) => {
    const colors = [
      'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700',
      'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-700',
      'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-700',
      'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-700',
      'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-700'
    ]
    return colors[tier - 1] || colors[0]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Generating probability scenarios...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Creating 6 tracks with 30 signposts
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Target size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Set a target outcome to generate scenario analysis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="scenario-display-panel h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
      {/* Target Outcome Header */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Target size={24} className="text-blue-600 dark:text-blue-400" />
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
            Target Outcome Analysis
          </h2>
        </div>
        <p className="text-blue-800 dark:text-blue-200 text-lg font-medium">
          {data.targetOutcome}
        </p>
      </div>

      {/* Probability Tracks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        {data.tracks.map((track, trackIndex) => (
          <div
            key={trackIndex}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
          >
            {/* Track Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {track.label}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getProbabilityColor(track.probability)}`}>
                  {track.probability}%
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {track.description}
              </p>
            </div>

            {/* Signposts */}
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">
                Signpost Indicators
              </h4>
              <div className="space-y-3">
                {track.signposts.map((signpost, signpostIndex) => (
                  <div
                    key={signpostIndex}
                    className={`border rounded-lg p-3 ${getTierColor(signpost.tier)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Tier {signpost.tier}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Clock size={10} className="text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {signpost.timeframe}
                          </span>
                        </div>
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded font-medium">
                          {signpost.confidence}%
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {signpost.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Uncertainties */}
        {data.keyUncertainties && data.keyUncertainties.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                Critical Uncertainties to Monitor
              </h3>
            </div>
            <ul className="space-y-2">
              {data.keyUncertainties.map((uncertainty, index) => (
                <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold mt-1">⚠</span>
                  {uncertainty}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Methodology */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={20} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Forecasting Methodology
            </h3>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
            {data.methodology}
          </p>
        </div>
      </div>
    </div>
  )
}