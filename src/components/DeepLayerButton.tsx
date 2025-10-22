'use client'

import React from 'react'
import { Layers, Loader2 } from 'lucide-react'

interface DeepLayerButtonProps {
  onGenerateDeepLayer: () => void
  isGenerating: boolean
  currentMaxOrder: number
  maxAllowedOrder: number
  disabled?: boolean
}

export function DeepLayerButton({
  onGenerateDeepLayer,
  isGenerating,
  currentMaxOrder,
  maxAllowedOrder,
  disabled
}: DeepLayerButtonProps) {
  const canGenerateMore = currentMaxOrder < maxAllowedOrder
  const nextLayerNumber = currentMaxOrder + 1

  if (!canGenerateMore) {
    return null // Hide button when max layers reached
  }

  const getOrdinalSuffix = (num: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th']
    return num > 3 ? 'th' : suffixes[num] || 'th'
  }

  return (
    <button
      onClick={onGenerateDeepLayer}
      disabled={disabled || isGenerating || !canGenerateMore}
      className="flex items-center gap-2 px-4 py-2 bg-purple-600 dark:bg-purple-600 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title={`Generate ${nextLayerNumber}${getOrdinalSuffix(nextLayerNumber)} order consequences`}
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Generating Layer {nextLayerNumber}...
        </>
      ) : (
        <>
          <Layers size={16} />
          Add {nextLayerNumber}{getOrdinalSuffix(nextLayerNumber)} Order Layer
        </>
      )}
    </button>
  )
}