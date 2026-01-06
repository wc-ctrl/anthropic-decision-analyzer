'use client'

import { useState, useCallback, useEffect } from 'react'

type ModeType = 'decision' | 'forecast' | 'scenario' | 'strategy'

interface OnboardingState {
  seenModes: Set<ModeType>
  skipAll: boolean
  initialized: boolean
}

const SESSION_KEY = 'claudeswitz_onboarding_session'

/**
 * Hook to manage onboarding state for the current session.
 * - Tracks which modes have shown their onboarding tutorial
 * - Provides opt-out to skip all tutorials for the session
 * - Resets on page reload (session-based, not persistent)
 */
export function useOnboarding() {
  // Start with uninitialized state - will load from sessionStorage in useEffect
  const [state, setState] = useState<OnboardingState>({
    seenModes: new Set(),
    skipAll: false,
    initialized: false
  })

  // Load from sessionStorage on client-side mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState({
          seenModes: new Set(parsed.seenModes || []),
          skipAll: parsed.skipAll || false,
          initialized: true
        })
      } else {
        setState(prev => ({ ...prev, initialized: true }))
      }
    } catch {
      setState(prev => ({ ...prev, initialized: true }))
    }
  }, [])

  // Persist state changes to sessionStorage
  const persistState = useCallback((newState: OnboardingState) => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        seenModes: Array.from(newState.seenModes),
        skipAll: newState.skipAll
      }))
    } catch {
      // Ignore storage errors
    }
  }, [])

  /**
   * Check if onboarding should be shown for a mode
   * Returns false if not yet initialized to prevent flash
   */
  const shouldShowOnboarding = useCallback((mode: ModeType): boolean => {
    if (!state.initialized) return false
    if (state.skipAll) return false
    return !state.seenModes.has(mode)
  }, [state.initialized, state.skipAll, state.seenModes])

  /**
   * Mark a mode's onboarding as seen
   */
  const markModeSeen = useCallback((mode: ModeType) => {
    setState(prev => {
      const newSeenModes = new Set(prev.seenModes)
      newSeenModes.add(mode)
      const newState = { ...prev, seenModes: newSeenModes }
      persistState(newState)
      return newState
    })
  }, [persistState])

  /**
   * Skip all onboarding tutorials for this session
   */
  const skipAllOnboarding = useCallback(() => {
    setState(prev => {
      const newState = { ...prev, skipAll: true }
      persistState(newState)
      return newState
    })
  }, [persistState])

  /**
   * Reset onboarding state (useful for testing)
   */
  const resetOnboarding = useCallback(() => {
    const newState: OnboardingState = { seenModes: new Set<ModeType>(), skipAll: false, initialized: true }
    setState(newState)
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // Ignore storage errors
    }
  }, [])

  return {
    shouldShowOnboarding,
    markModeSeen,
    skipAllOnboarding,
    resetOnboarding,
    hasSkippedAll: state.skipAll,
    isInitialized: state.initialized
  }
}
