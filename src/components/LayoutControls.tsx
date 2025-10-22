'use client'

import React from 'react'
import { RefreshCw, Maximize2 } from 'lucide-react'

interface LayoutControlsProps {
  onAutoLayout: () => void
  onFitView: () => void
  isGenerating?: boolean
}

export function LayoutControls({ onAutoLayout, onFitView, isGenerating }: LayoutControlsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onAutoLayout}
        disabled={isGenerating}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Auto-arrange nodes to prevent overlap"
      >
        <RefreshCw size={14} />
        Auto-Layout
      </button>
      <button
        onClick={onFitView}
        className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
        title="Fit all nodes in view"
      >
        <Maximize2 size={14} />
        Fit View
      </button>
    </div>
  )
}