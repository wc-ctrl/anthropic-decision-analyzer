'use client'

import React from 'react'
import { Crosshair, Loader2 } from 'lucide-react'

interface GoalClarifierButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
}

export function GoalClarifierButton({ onClick, isLoading, disabled }: GoalClarifierButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
      title="Clarify your goal before analysis"
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Crosshair size={16} />
          Clarify Goal
        </>
      )}
    </button>
  )
}
