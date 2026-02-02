'use client'

import React, { useState } from 'react'
import { Send, Loader2, Sparkles } from 'lucide-react'

interface InputPanelProps {
  mode: 'decision' | 'forecast' | 'scenario' | 'strategy' | 'framework'
  onSubmit: (input: string) => void
  isGenerating: boolean
}

export function InputPanel({ mode, onSubmit, isGenerating }: InputPanelProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isGenerating) {
      onSubmit(input.trim())
      setInput('')
    }
  }

  const placeholders: Record<string, string> = {
    decision: 'What decision are you considering? (e.g., "Launch product in Q2" or multiple: "Option A, Option B")',
    forecast: 'What outcome do you want to trace back? (e.g., "AI regulation passes in 2025")',
    scenario: 'What future state are you exploring? (e.g., "Competitor launches rival product")',
    strategy: 'What strategic goal are you pursuing? (e.g., "Become market leader in 3 years")',
    framework: 'Describe the case or situation to analyze (e.g., "Should we build our own auth system or use Auth0?")',
  }

  const buttonLabels: Record<string, string> = {
    decision: 'Analyze Consequences',
    forecast: 'Trace Causes',
    scenario: 'Explore Scenario',
    strategy: 'Build Strategy',
    framework: 'Apply Framework',
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={`
          relative flex items-center gap-3 p-2 rounded-xl transition-all duration-200
          ${isFocused
            ? 'bg-[var(--bg-elevated)] ring-2 ring-[var(--accent-gold)] shadow-[var(--shadow-glow)]'
            : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
          }
        `}
      >
        {/* Sparkle icon */}
        <div className="pl-2">
          <Sparkles
            size={20}
            className={`transition-colors duration-200 ${isFocused ? 'text-[var(--accent-gold)]' : 'text-[var(--text-muted)]'}`}
          />
        </div>

        {/* Input field */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholders[mode]}
          disabled={isGenerating}
          className="
            flex-1 bg-transparent border-none outline-none
            text-[var(--text-primary)] placeholder-[var(--text-muted)]
            text-base py-2
            disabled:opacity-50
          "
          style={{ fontFamily: 'var(--font-body)' }}
        />

        {/* Submit button */}
        <button
          type="submit"
          disabled={!input.trim() || isGenerating}
          className={`
            cw-btn cw-btn-primary
            ${!input.trim() || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Send size={16} />
              <span>{buttonLabels[mode]}</span>
            </>
          )}
        </button>
      </div>

      {/* Subtle hint below */}
      <p className="mt-2 text-xs text-center" style={{ color: 'var(--text-muted)' }}>
        {mode === 'framework'
          ? 'Claude will apply the selected framework to your case'
          : 'Tip: Separate multiple items with commas to analyze them together'
        }
      </p>
    </form>
  )
}
