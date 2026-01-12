'use client'

import React, { useState, useEffect } from 'react'
import { X, Users, Loader2 } from 'lucide-react'
import { SimulationState, KeyMoment, RecommendedStep } from '@/types/simulation'
import { SimulationActorPanel } from './SimulationActorPanel'
import { SimulationTimeline } from './SimulationTimeline'
import { SimulationRecommendations } from './SimulationRecommendations'
import { SimulationControls } from './SimulationControls'
import { SimulationKeyMomentAlert } from './SimulationKeyMomentAlert'

interface SimulationModalProps {
  isOpen: boolean
  onClose: () => void
  state: SimulationState
  onStep: () => void
  onToggleAutoplay: () => void
  onTogglePauseOnKeyMoments: () => void
  onReset: () => void
  onUpdateGuidance: (guidance: string) => void
  onContinueFromPause: () => void
  keyMomentAlert?: KeyMoment | null
}

export function SimulationModal({
  isOpen,
  onClose,
  state,
  onStep,
  onToggleAutoplay,
  onTogglePauseOnKeyMoments,
  onReset,
  onUpdateGuidance,
  onContinueFromPause,
  keyMomentAlert
}: SimulationModalProps) {
  const [selectedActorId, setSelectedActorId] = useState<string | undefined>()

  // Get latest recommendations from the most recent round
  const latestRecommendations: RecommendedStep[] = state.rounds.length > 0
    ? state.rounds[state.rounds.length - 1].recommendations || []
    : []

  if (!isOpen) return null

  const isInitializing = state.status === 'initializing'

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Anticipatory Intelligence Simulation
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Multi-actor scenario simulation with parallel Claude instances
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Main Content */}
          {isInitializing ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={48} className="animate-spin text-emerald-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  Analyzing context and identifying actors...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  This may take a moment
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel: Actors */}
              <div className="w-72 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <SimulationActorPanel
                  actors={state.actors}
                  selectedActorId={selectedActorId}
                  onSelectActor={setSelectedActorId}
                />
              </div>

              {/* Center Panel: Timeline */}
              <div className="flex-1 p-4 overflow-y-auto">
                <SimulationTimeline
                  rounds={state.rounds}
                  actors={state.actors}
                  currentRound={state.currentRound}
                />
              </div>

              {/* Right Panel: Recommendations */}
              <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900/50">
                <SimulationRecommendations
                  recommendations={latestRecommendations}
                  actors={state.actors}
                  userGuidance={state.userGuidance || ''}
                  onGuidanceChange={onUpdateGuidance}
                />
              </div>
            </div>
          )}

          {/* Controls Footer */}
          <SimulationControls
            status={state.status}
            currentRound={state.currentRound}
            maxRounds={state.maxRounds}
            autoplayEnabled={state.autoplayEnabled}
            pauseOnKeyMoments={state.pauseOnKeyMoments}
            onStep={onStep}
            onToggleAutoplay={onToggleAutoplay}
            onTogglePauseOnKeyMoments={onTogglePauseOnKeyMoments}
            onReset={onReset}
          />
        </div>
      </div>

      {/* Key Moment Alert Overlay */}
      {keyMomentAlert && (
        <SimulationKeyMomentAlert
          moment={keyMomentAlert}
          actors={state.actors}
          onContinue={onContinueFromPause}
          onPause={() => {}} // Already paused, this is just to dismiss the alert
        />
      )}
    </>
  )
}
