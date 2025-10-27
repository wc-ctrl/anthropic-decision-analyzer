'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Target, TrendingUp, TrendingDown } from 'lucide-react'
import { DecisionNode, AnalysisMode } from '@/types/decision'

interface QuickAssessment {
  verdict: 'proceed' | 'caution' | 'avoid'
  confidence: number
  netBenefit: number
  summary: string
  keyFactors: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  bottomLine: string
}

interface QuickAssessmentPanelProps {
  nodes: DecisionNode[]
  mode: AnalysisMode
  loading?: boolean
}

export function QuickAssessmentPanel({ nodes, mode, loading }: QuickAssessmentPanelProps) {
  const [assessment, setAssessment] = useState<QuickAssessment | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (nodes.length > 1 && !loading) {
      generateQuickAssessment()
    }
  }, [nodes, mode])

  const generateQuickAssessment = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch('/api/quick-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          analysisType: mode.type,
          decision: mode.rootInput
        })
      })

      if (response.ok) {
        const assessmentData = await response.json()
        setAssessment(assessmentData)
      }
    } catch (error) {
      console.error('Failed to generate quick assessment:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (nodes.length <= 1) return null

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'proceed':
        return <CheckCircle size={24} className="text-green-500" />
      case 'caution':
        return <AlertCircle size={24} className="text-yellow-500" />
      case 'avoid':
        return <XCircle size={24} className="text-red-500" />
      default:
        return <Target size={24} className="text-gray-500" />
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'proceed':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-100'
      case 'caution':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-100'
      case 'avoid':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-900 dark:text-red-100'
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100'
    }
  }

  const getVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'proceed': return 'PROCEED'
      case 'caution': return 'PROCEED WITH CAUTION'
      case 'avoid': return 'AVOID'
      default: return 'ANALYZING...'
    }
  }

  if (isGenerating || !assessment) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3 mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Quick Assessment
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyzing net benefit and generating strategic verdict...
        </p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg p-4 border ${getVerdictColor(assessment.verdict)}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {getVerdictIcon(assessment.verdict)}
        <div>
          <h3 className="font-semibold">
            Quick Assessment
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              {getVerdictLabel(assessment.verdict)}
            </span>
            <span className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">
              {assessment.confidence}% confidence
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="mb-3">
        <h4 className="text-sm font-semibold mb-1">BOTTOM LINE:</h4>
        <p className="text-sm font-medium">
          {assessment.bottomLine}
        </p>
      </div>

      {/* Net Benefit Score */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Net Benefit Score:</span>
          <div className="flex items-center gap-2">
            {assessment.netBenefit > 0 ? (
              <TrendingUp size={14} className="text-green-500" />
            ) : (
              <TrendingDown size={14} className="text-red-500" />
            )}
            <span className="font-bold">
              {assessment.netBenefit > 0 ? '+' : ''}{assessment.netBenefit}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
          <div
            className={`h-2 rounded-full ${assessment.netBenefit > 0 ? 'bg-green-500' : 'bg-red-500'}`}
            style={{
              width: `${Math.min(100, Math.abs(assessment.netBenefit) * 10)}%`
            }}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm">
        <p className="leading-relaxed">
          {assessment.summary}
        </p>
      </div>

      {/* Key Factors (condensed) */}
      {(assessment.keyFactors.positive.length > 0 || assessment.keyFactors.negative.length > 0) && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {assessment.keyFactors.positive.length > 0 && (
              <div>
                <h5 className="font-medium mb-1 text-green-700 dark:text-green-300">Pros ({assessment.keyFactors.positive.length}):</h5>
                <ul className="space-y-1">
                  {assessment.keyFactors.positive.slice(0, 2).map((factor, index) => (
                    <li key={index} className="text-green-600 dark:text-green-400">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {assessment.keyFactors.negative.length > 0 && (
              <div>
                <h5 className="font-medium mb-1 text-red-700 dark:text-red-300">Cons ({assessment.keyFactors.negative.length}):</h5>
                <ul className="space-y-1">
                  {assessment.keyFactors.negative.slice(0, 2).map((factor, index) => (
                    <li key={index} className="text-red-600 dark:text-red-400">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}