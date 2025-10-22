'use client'

import React, { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface InputPanelProps {
  mode: 'decision' | 'forecast'
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
    : 'Enter a forecast or prediction (e.g., "AI will significantly impact hiring in 2024")'

  const buttonText = mode === 'decision' ? 'Analyze Consequences' : 'Explore Pathways'

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1 max-w-2xl">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        disabled={isGenerating}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
      />
      <button
        type="submit"
        disabled={!input.trim() || isGenerating}
        className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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