'use client'

import React from 'react'
import { X, Shield, TrendingUp, CheckCircle } from 'lucide-react'

interface SteelmanData {
  title: string
  summary: string
  arguments: Array<{
    point: string
    evidence: string
    probability?: number
    strength: 'high' | 'medium' | 'low'
  }>
  successFactors?: Array<{
    factor: string
    likelihood: number
    impact: string
  }>
  conclusion: string
  recommendedActions?: string[]
}

interface SteelmanModalProps {
  isOpen: boolean
  onClose: () => void
  data: SteelmanData | null
  analysisType: 'decision' | 'forecast' | 'scenario' | 'strategy'
  loading: boolean
}

export function SteelmanModal({
  isOpen,
  onClose,
  data,
  analysisType,
  loading
}: SteelmanModalProps) {
  if (!isOpen) return null

  const getStrengthColor = (strength: 'high' | 'medium' | 'low') => {
    switch (strength) {
      case 'high': return 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30'
      case 'medium': return 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30'
      case 'low': return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700/30'
    }
  }

  const modalTitle = analysisType === 'decision'
    ? 'Steelman: Strongest Arguments For This Decision'
    : analysisType === 'forecast'
    ? 'Steelman: Why This Outcome Will Happen'
    : 'Steelman: Best-Case Analysis'

  const modalIcon = analysisType === 'decision'
    ? <Shield size={24} className="text-green-600 dark:text-green-400" />
    : <TrendingUp size={24} className="text-green-600 dark:text-green-400" />

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            {modalIcon}
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {modalTitle}
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Building the strongest possible case...
                </p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  {data.title}
                </h3>
                <p className="text-green-800 dark:text-green-200 leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Key Arguments */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  Strongest Supporting Arguments
                </h4>
                <div className="space-y-4">
                  {data.arguments.map((arg, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-gray-900 dark:text-white flex-1">
                          {arg.point}
                        </h5>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStrengthColor(arg.strength)}`}>
                          {arg.strength.toUpperCase()} STRENGTH
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                        {arg.evidence}
                      </p>
                      {arg.probability && (
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                              style={{ width: `${arg.probability}%` }}
                            />
                          </div>
                          <span className="font-medium">{arg.probability}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Factors (for forecast mode) */}
              {data.successFactors && data.successFactors.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Enabling Success Factors
                  </h4>
                  <div className="space-y-3">
                    {data.successFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-700"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-medium text-green-900 dark:text-green-100">
                            {factor.factor}
                          </h5>
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                            {factor.likelihood}% likely
                          </span>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200">
                          {factor.impact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conclusion */}
              <div className="bg-green-100 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                  Steelman Conclusion
                </h4>
                <p className="text-green-800 dark:text-green-200 leading-relaxed">
                  {data.conclusion}
                </p>
              </div>

              {/* Recommended Actions */}
              {data.recommendedActions && data.recommendedActions.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Strategic Actions to Maximize Success
                  </h4>
                  <ul className="space-y-2">
                    {data.recommendedActions.map((action, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-green-700 dark:text-green-300">Steelman Analysis</strong> presents the strongest possible case for this {analysisType}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
