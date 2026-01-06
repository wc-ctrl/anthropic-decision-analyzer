'use client'

import React from 'react'
import { SimulationStatus } from '@/types/simulation'
import { Play, Pause, SkipForward, RotateCcw, Loader2, CheckCircle } from 'lucide-react'

interface SimulationControlsProps {
  status: SimulationStatus
  currentRound: number
  maxRounds: number
  autoplayEnabled: boolean
  pauseOnKeyMoments: boolean
  onStep: () => void
  onToggleAutoplay: () => void
  onTogglePauseOnKeyMoments: () => void
  onReset: () => void
}

const getStatusLabel = (status: SimulationStatus) => {
  switch (status) {
    case 'idle': return 'Idle'
    case 'initializing': return 'Initializing...'
    case 'ready': return 'Ready'
    case 'running': return 'Running'
    case 'step_phase': return 'Actors deciding...'
    case 'resolve_phase': return 'Resolving outcomes...'
    case 'paused': return 'Paused'
    case 'completed': return 'Complete'
    case 'error': return 'Error'
  }
}

const getStatusColor = (status: SimulationStatus) => {
  switch (status) {
    case 'idle':
    case 'ready': return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
    case 'initializing':
    case 'running':
    case 'step_phase':
    case 'resolve_phase': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    case 'paused': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    case 'completed': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'error': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
}

export function SimulationControls({
  status,
  currentRound,
  maxRounds,
  autoplayEnabled,
  pauseOnKeyMoments,
  onStep,
  onToggleAutoplay,
  onTogglePauseOnKeyMoments,
  onReset
}: SimulationControlsProps) {
  const isRunning = ['initializing', 'running', 'step_phase', 'resolve_phase'].includes(status)
  const isComplete = status === 'completed'
  const canStep = ['ready', 'paused'].includes(status) && !isComplete

  return (
    <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      {/* Left: Status and Progress */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded ${getStatusColor(status)}`}>
            {isRunning && <Loader2 size={12} className="inline mr-1 animate-spin" />}
            {isComplete && <CheckCircle size={12} className="inline mr-1" />}
            {getStatusLabel(status)}
          </span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Round <span className="font-medium text-gray-900 dark:text-white">{currentRound}</span> / {maxRounds}
        </div>
        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(currentRound / maxRounds) * 100}%` }}
          />
        </div>
      </div>

      {/* Center: Main Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onStep}
          disabled={!canStep || isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <SkipForward size={16} />
          Step
        </button>

        <button
          onClick={onToggleAutoplay}
          disabled={isComplete}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            autoplayEnabled
              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
          } disabled:opacity-50`}
        >
          {autoplayEnabled ? (
            <>
              <Pause size={16} />
              Pause
            </>
          ) : (
            <>
              <Play size={16} />
              Autoplay
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Right: Options */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={pauseOnKeyMoments}
            onChange={onTogglePauseOnKeyMoments}
            className="rounded border-gray-300 dark:border-gray-600 text-emerald-600 focus:ring-emerald-500"
          />
          Pause on key moments
        </label>
      </div>
    </div>
  )
}
