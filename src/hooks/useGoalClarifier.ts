'use client'

import { useState, useCallback } from 'react'
import { GoalDefinition, GoalClarifierStep, GoalClarifierState } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

const initialState: GoalClarifierState = {
  currentStep: 'initial',
  goal: {},
  isLoading: false,
  error: undefined
}

export function useGoalClarifier() {
  const [state, setState] = useState<GoalClarifierState>(initialState)

  const updateState = useCallback((updates: Partial<GoalClarifierState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  const reset = useCallback(() => {
    setState(initialState)
  }, [])

  const analyzeGoal = useCallback(async () => {
    if (!state.goal.rawInput?.trim()) return

    updateState({ isLoading: true, error: undefined })

    try {
      const response = await fetch('/api/goal-clarifier/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: state.goal.rawInput })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze goal')
      }

      const data = await response.json()

      updateState({
        isLoading: false,
        goal: {
          ...state.goal,
          id: uuidv4(),
          initialAnalysis: data.initialAnalysis,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error analyzing goal:', error)
      updateState({
        isLoading: false,
        error: 'Failed to analyze goal. Please try again.'
      })
    }
  }, [state.goal, updateState])

  const refineGoal = useCallback(async () => {
    updateState({ isLoading: true, error: undefined })

    try {
      const response = await fetch('/api/goal-clarifier/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: state.goal })
      })

      if (!response.ok) {
        throw new Error('Failed to refine goal')
      }

      const data = await response.json()

      updateState({
        isLoading: false,
        goal: {
          ...state.goal,
          refinedGoal: data.refinedGoal,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error refining goal:', error)
      updateState({
        isLoading: false,
        error: 'Failed to refine goal. Please try again.'
      })
    }
  }, [state.goal, updateState])

  return {
    state,
    updateState,
    reset,
    analyzeGoal,
    refineGoal
  }
}
