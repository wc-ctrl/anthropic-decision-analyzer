'use client'

import React, { useState } from 'react'
import { Settings, ChevronDown, ChevronUp } from 'lucide-react'

interface ExpertSettingsProps {
  isExpertMode: boolean
  firstOrderCount: number
  secondOrderCount: number
  onSettingsChange: (firstOrder: number, secondOrder: number) => void
  disabled?: boolean
}

export function ExpertSettings({
  isExpertMode,
  firstOrderCount,
  secondOrderCount,
  onSettingsChange,
  disabled
}: ExpertSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isExpertMode) return null

  const handleFirstOrderChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, firstOrderCount + delta))
    onSettingsChange(newCount, secondOrderCount)
  }

  const handleSecondOrderChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(10, secondOrderCount + delta))
    onSettingsChange(firstOrderCount, newCount)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-800/30 text-red-700 dark:text-red-300 rounded-lg transition-colors text-sm font-medium"
        title="Expert Mode: Configure consequence counts"
      >
        <Settings size={14} />
        {firstOrderCount}→{secondOrderCount}
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-10 min-w-[280px]">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Expert Analysis Settings</h3>

          {/* First Order Count */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              First-Order Consequences (1-10)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleFirstOrderChange(-1)}
                disabled={disabled || firstOrderCount <= 1}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown size={14} />
              </button>
              <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                {firstOrderCount}
              </span>
              <button
                onClick={() => handleFirstOrderChange(1)}
                disabled={disabled || firstOrderCount >= 10}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp size={14} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                direct consequences
              </span>
            </div>
          </div>

          {/* Second Order Count */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Second-Order per First-Order (1-10)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleSecondOrderChange(-1)}
                disabled={disabled || secondOrderCount <= 1}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown size={14} />
              </button>
              <span className="text-lg font-semibold text-gray-900 dark:text-white min-w-[2rem] text-center">
                {secondOrderCount}
              </span>
              <button
                onClick={() => handleSecondOrderChange(1)}
                disabled={disabled || secondOrderCount >= 10}
                className="w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronUp size={14} />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                per first-order
              </span>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="text-sm text-red-800 dark:text-red-200">
              <strong>Total nodes:</strong> {1 + firstOrderCount + (firstOrderCount * secondOrderCount)}
            </div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">
              1 root + {firstOrderCount} first + {firstOrderCount * secondOrderCount} second-order
            </div>
          </div>
        </div>
      )}
    </div>
  )
}