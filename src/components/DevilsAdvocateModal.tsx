'use client'

import React from 'react'
import { X, AlertTriangle, TrendingDown, Target } from 'lucide-react'

interface DevilsAdvocateData {
  title: string
  summary: string
  arguments: Array<{
    point: string
    evidence: string
    probability?: number
    impact: 'high' | 'medium' | 'low'
  }>
  riskFactors?: Array<{
    factor: string
    likelihood: number
    severity: string
  }>
  conclusion: string
  recommendedActions?: string[]
}

interface DevilsAdvocateModalProps {
  isOpen: boolean
  onClose: () => void
  data: DevilsAdvocateData | null
  analysisType: 'decision' | 'forecast'
  loading: boolean
}

export function DevilsAdvocateModal({
  isOpen,
  onClose,
  data,
  analysisType,
  loading
}: DevilsAdvocateModalProps) {
  if (!isOpen) return null

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
    }
  }

  const modalTitle = analysisType === 'decision'
    ? 'Devil\'s Advocate: Arguments Against This Decision'
    : 'Devil\'s Advocate: Why This Outcome Won\'t Happen'

  const modalIcon = analysisType === 'decision'
    ? <AlertTriangle size={24} className="text-red-500" />
    : <TrendingDown size={24} className="text-red-500" />

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">
                  Generating rigorous contrarian analysis...
                </p>
              </div>
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                  {data.title}
                </h3>
                <p className="text-red-800 dark:text-red-200 leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Key Arguments */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target size={20} />
                  Key Counterarguments
                </h3>
                <div className="space-y-4">
                  {data.arguments.map((arg, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border-l-4 border-red-500">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {arg.point}
                        </h4>
                        <div className="flex gap-2">
                          {arg.probability && (
                            <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                              {arg.probability}% risk
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getImpactColor(arg.impact)}`}>
                            {arg.impact} impact
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {arg.evidence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              {data.riskFactors && data.riskFactors.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Critical Risk Factors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.riskFactors.map((risk, index) => (
                      <div key={index} className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-yellow-900 dark:text-yellow-100 text-sm">
                            {risk.factor}
                          </h4>
                          <span className="text-xs font-bold bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                            {risk.likelihood}%
                          </span>
                        </div>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          {risk.severity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conclusion */}
              <div className="bg-gray-800 dark:bg-gray-900 text-white rounded-lg p-4">
                <h3 className="font-semibold mb-3">Strategic Recommendation</h3>
                <p className="leading-relaxed mb-4">
                  {data.conclusion}
                </p>

                {/* Recommended Actions */}
                {data.recommendedActions && data.recommendedActions.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommended Mitigations:</h4>
                    <ul className="space-y-1">
                      {data.recommendedActions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-red-400 font-bold">•</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                Failed to generate devil's advocate analysis
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Contrarian analysis • Evidence-based counterarguments • Risk assessment
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}