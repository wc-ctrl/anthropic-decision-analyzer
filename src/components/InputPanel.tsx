'use client'

import React, { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface InputPanelProps {
  mode: 'decision' | 'forecast' | 'scenario'
  onSubmit: (input: string) => void
  isGenerating: boolean
}

export function InputPanel({ mode, onSubmit, isGenerating }: InputPanelProps) {
  const [input, setInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isGenerating) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  const placeholder = mode === 'decision'
    ? 'Enter a decision you\'re considering (e.g., "Launch new product line in Q2")'
    : mode === 'forecast'
    ? 'Enter an outcome you want to understand (e.g., "Company reaches $100B revenue by 2026")'
    : 'Enter a future outcome for scenario analysis (e.g., "AGI developed by frontier lab in 2026")'

  const buttonText = mode === 'decision'
    ? 'Analyze Consequences'
    : mode === 'forecast'
    ? 'Map Causal Chain'
    : 'Set Target Outcome'

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 max-w-2xl">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={isGenerating}
        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
      />
      <button
        type="submit"
        disabled={!input.trim() || isGenerating}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Send size={16} />
            {buttonText}
          </>
        )}
      </button>
    </form>
  )
}