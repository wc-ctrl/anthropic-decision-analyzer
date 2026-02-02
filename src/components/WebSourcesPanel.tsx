'use client'

import React, { useState } from 'react'

interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

interface WebSourcesPanelProps {
  searchResults: SearchResult[]
  queryCount?: number
  lastUpdated?: string
}

export function WebSourcesPanel({ searchResults, queryCount, lastUpdated }: WebSourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSnippet, setExpandedSnippet] = useState<number | null>(null)

  if (searchResults.length === 0) return null

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            {searchResults.length} web source{searchResults.length !== 1 ? 's' : ''}
          </span>
          {queryCount && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              ({queryCount} queries)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Anthropic Search
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {searchResults.map((result, i) => (
            <div key={i} className="py-1.5">
              <div className="flex items-start gap-2">
                <span className="text-xs mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }}>
                  {i + 1}.
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium hover:underline block truncate"
                    style={{ color: 'var(--accent-gold)' }}
                    title={result.title}
                  >
                    {result.title}
                  </a>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {result.source}
                  </span>
                  {result.snippet && (
                    <button
                      onClick={() => setExpandedSnippet(expandedSnippet === i ? null : i)}
                      className="text-xs block mt-0.5 text-left"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {expandedSnippet === i
                        ? result.snippet
                        : `${result.snippet.substring(0, 80)}...`
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {lastUpdated && (
            <div className="text-xs pt-1" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}>
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
