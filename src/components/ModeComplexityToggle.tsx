'use client'

import React from 'react'
import { Zap, Settings } from 'lucide-react'

interface ModeComplexityToggleProps {
  isExpert: boolean
  onToggle: (isExpert: boolean) => void
  disabled?: boolean
}

export function ModeComplexityToggle({ isExpert, onToggle, disabled }: ModeComplexityToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Mode:
      </span>
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => onToggle(false)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all ${
            !isExpert
              ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Easy Mode: Simplified analysis (3→1→1 structure)"
        >
          <Zap size={14} />
          Easy
        </button>
        <button
          onClick={() => onToggle(true)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-all ${
            isExpert
              ? 'bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
          title="Expert Mode: Comprehensive analysis (5→2→1 structure)"
        >
          <Settings size={14} />
          Expert
        </button>
      </div>

      {/* Mode Description */}
      <div className="text-xs text-gray-500 dark:text-gray-400 ml-2">
        {isExpert ? (
          <span>Full analysis: 5→2 per level + advanced scaffolds</span>
        ) : (
          <span>Quick analysis: 3→1 per level + simplified</span>
        )}
      </div>
    </div>
  )
}