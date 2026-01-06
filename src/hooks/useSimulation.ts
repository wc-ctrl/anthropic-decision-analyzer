'use client'

import { useState, useCallback, useRef } from 'react'
import { SimulationState, SimulationStatus, KeyMoment, Actor, RoundResult } from '@/types/simulation'
import { v4 as uuidv4 } from 'uuid'

const initialState: SimulationState = {
  id: '',
  status: 'idle',
  context: '',
  actors: [],
  rounds: [],
  currentRound: 0,
  maxRounds: 10,
  autoplayEnabled: false,
  pauseOnKeyMoments: true,
  userGuidance: '',
  createdAt: new Date(),
  updatedAt: new Date()
}

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(initialState)
  const [keyMomentAlert, setKeyMomentAlert] = useState<KeyMoment | null>(null)
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const updateState = useCallback((updates: Partial<SimulationState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      updatedAt: new Date()
    }))
  }, [])

  const reset = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current)
      autoplayIntervalRef.current = null
    }
    setState(initialState)
    setKeyMomentAlert(null)
  }, [])

  const initialize = useCallback(async (context: string) => {
    updateState({
      id: uuidv4(),
      status: 'initializing',
      context,
      actors: [],
      rounds: [],
      currentRound: 0
    })

    try {
      const response = await fetch('/api/simulation/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context })
      })

      if (!response.ok) {
        throw new Error('Failed to initialize simulation')
      }

      const data = await response.json()

      updateState({
        status: 'ready',
        actors: data.actors,
        error: undefined
      })
    } catch (error) {
      console.error('Simulation init error:', error)
      updateState({
        status: 'error',
        error: 'Failed to initialize simulation'
      })
    }
  }, [updateState])

  const step = useCallback(async () => {
    if (!['ready', 'paused'].includes(state.status)) return
    if (state.currentRound >= state.maxRounds) {
      updateState({ status: 'completed' })
      return
    }

    const nextRound = state.currentRound + 1

    // Step Phase: Get all actor actions
    updateState({ status: 'step_phase' })

    try {
      const stepResponse = await fetch('/api/simulation/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId: state.id,
          actors: state.actors,
          currentRound: nextRound,
          previousRounds: state.rounds,
          userGuidance: state.userGuidance
        })
      })

      if (!stepResponse.ok) {
        throw new Error('Failed to get actor actions')
      }

      const stepData = await stepResponse.json()

      // Resolve Phase: Determine outcomes
      updateState({ status: 'resolve_phase' })

      const resolveResponse = await fetch('/api/simulation/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulationId: state.id,
          actors: state.actors,
          currentRound: nextRound,
          actions: stepData.actions,
          previousRounds: state.rounds,
          context: state.context
        })
      })

      if (!resolveResponse.ok) {
        throw new Error('Failed to resolve round')
      }

      const resolveData = await resolveResponse.json()

      // Update state with results
      const newRounds = [...state.rounds, resolveData.roundResult]

      updateState({
        actors: resolveData.updatedActors,
        rounds: newRounds,
        currentRound: nextRound,
        status: resolveData.isComplete ? 'completed' :
                resolveData.shouldPause && state.pauseOnKeyMoments ? 'paused' : 'ready'
      })

      // Show key moment alert if needed
      if (resolveData.shouldPause && resolveData.pauseReason && state.pauseOnKeyMoments) {
        setKeyMomentAlert(resolveData.pauseReason)
        // Stop autoplay when pausing
        if (autoplayIntervalRef.current) {
          clearInterval(autoplayIntervalRef.current)
          autoplayIntervalRef.current = null
          updateState({ autoplayEnabled: false })
        }
      }

    } catch (error) {
      console.error('Simulation step error:', error)
      updateState({
        status: 'error',
        error: 'Failed to advance simulation'
      })
    }
  }, [state, updateState])

  const toggleAutoplay = useCallback(() => {
    if (state.autoplayEnabled) {
      // Stop autoplay
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current)
        autoplayIntervalRef.current = null
      }
      updateState({ autoplayEnabled: false })
    } else {
      // Start autoplay
      updateState({ autoplayEnabled: true })
      // Immediately run a step
      step()
      // Then set interval for subsequent steps
      autoplayIntervalRef.current = setInterval(() => {
        step()
      }, 3000) // 3 second delay between steps
    }
  }, [state.autoplayEnabled, step, updateState])

  const togglePauseOnKeyMoments = useCallback(() => {
    updateState({ pauseOnKeyMoments: !state.pauseOnKeyMoments })
  }, [state.pauseOnKeyMoments, updateState])

  const continueFromPause = useCallback(() => {
    setKeyMomentAlert(null)
    updateState({ status: 'ready' })
  }, [updateState])

  const updateGuidance = useCallback((guidance: string) => {
    updateState({ userGuidance: guidance })
  }, [updateState])

  return {
    state,
    keyMomentAlert,
    initialize,
    step,
    toggleAutoplay,
    togglePauseOnKeyMoments,
    reset,
    continueFromPause,
    updateGuidance
  }
}
