'use client'

import React from 'react'
import { GitBranch, TrendingUp } from 'lucide-react'

interface ModeSelectorProps {
  currentMode: 'decision' | 'forecast'
  onModeChange: (mode: 'decision' | 'forecast') => void
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onModeChange('decision')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'decision'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <GitBranch size={16} />
        Decision Analysis
      </button>
      <button
        onClick={() => onModeChange('forecast')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
          currentMode === 'forecast'
            ? 'bg-white text-green-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <TrendingUp size={16} />
        Forecast Analysis
      </button>
    </div>
  )
}