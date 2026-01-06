'use client'

import React from 'react'
import { Users, Loader2 } from 'lucide-react'

interface SimulationButtonProps {
  onClick: () => void
  isLoading?: boolean
  disabled?: boolean
  hasAnalysis?: boolean
}

export function SimulationButton({ onClick, isLoading, disabled, hasAnalysis }: SimulationButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading || !hasAnalysis}
      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-medium"
      title={hasAnalysis ? "Run multi-actor simulation" : "Run an analysis first to enable simulation"}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Simulating...
        </>
      ) : (
        <>
          <Users size={16} />
          Simulate Actors
        </>
      )}
    </button>
  )
}
