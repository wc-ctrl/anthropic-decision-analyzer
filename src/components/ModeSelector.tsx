'use client'

import React from 'react'
import { GitBranch, TrendingUp, Target, Map, LayoutGrid } from 'lucide-react'

type ModeType = 'decision' | 'forecast' | 'scenario' | 'strategy' | 'framework'

interface ModeSelectorProps {
  currentMode: ModeType
  onModeChange: (mode: ModeType) => void
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      <button
        onClick={() => onModeChange('decision')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'decision'
            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <GitBranch size={16} />
        Decision Analysis
      </button>
      <button
        onClick={() => onModeChange('forecast')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'forecast'
            ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <TrendingUp size={16} />
        Causal Analysis
      </button>
      <button
        onClick={() => onModeChange('scenario')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'scenario'
            ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Target size={16} />
        Scenario Analysis
      </button>
      <button
        onClick={() => onModeChange('strategy')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'strategy'
            ? 'bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <Map size={16} />
        Strategy Mode
      </button>
      <button
        onClick={() => onModeChange('framework')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'framework'
            ? 'bg-white dark:bg-gray-800 text-teal-600 dark:text-teal-400 shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        <LayoutGrid size={16} />
        Frameworks
      </button>
    </div>
  )
}
