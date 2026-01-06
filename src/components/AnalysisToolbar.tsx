'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, MoreHorizontal, RefreshCw, Swords, Shield, Users, Zap, Play, Share2, Download, Layout, Layers, Lightbulb, Plus } from 'lucide-react'

interface AnalysisToolbarProps {
  // State
  mode: { type: string; rootInput: string }
  hasAnalysis: boolean
  hasDocuments: boolean
  isExpertMode: boolean

  // Loading states
  isGenerating: boolean
  isGeneratingDeepLayer: boolean
  isSharing: boolean
  devilsAdvocateLoading: boolean
  steelmanLoading: boolean
  wargamingLoading: boolean
  weirdLoading: boolean
  scenarioLoading: boolean
  simulationRunning: boolean
  topicSuggestionLoading: boolean

  // Deep layer state
  currentMaxOrder: number
  maxAllowedOrder: number

  // Handlers
  onTopicSuggestions: () => void
  onAddContext: () => void
  onRerunAnalysis: () => void
  onDevilsAdvocate: () => void
  onSteelman: () => void
  onWargaming: () => void
  onGetWeird: () => void
  onSimulation: () => void
  onScenarioAnalysis: () => void
  onShare: () => void
  onAutoLayout: () => void
  onFitView: () => void
  onDeepLayer: () => void
  onExportPowerPoint: () => void
  onExportWord: () => void
}

export function AnalysisToolbar({
  mode,
  hasAnalysis,
  hasDocuments,
  isExpertMode,
  isGenerating,
  isGeneratingDeepLayer,
  isSharing,
  devilsAdvocateLoading,
  steelmanLoading,
  wargamingLoading,
  weirdLoading,
  scenarioLoading,
  simulationRunning,
  topicSuggestionLoading,
  currentMaxOrder,
  maxAllowedOrder,
  onTopicSuggestions,
  onAddContext,
  onRerunAnalysis,
  onDevilsAdvocate,
  onSteelman,
  onWargaming,
  onGetWeird,
  onSimulation,
  onScenarioAnalysis,
  onShare,
  onAutoLayout,
  onFitView,
  onDeepLayer,
  onExportPowerPoint,
  onExportWord
}: AnalysisToolbarProps) {
  const [moreToolsOpen, setMoreToolsOpen] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const moreToolsRef = useRef<HTMLDivElement>(null)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreToolsRef.current && !moreToolsRef.current.contains(event.target as Node)) {
        setMoreToolsOpen(false)
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const anyLoading = isGenerating || isGeneratingDeepLayer || isSharing ||
    devilsAdvocateLoading || steelmanLoading || wargamingLoading || weirdLoading

  const isScenarioMode = mode.type === 'scenario'
  const isStrategyMode = mode.type === 'strategy'
  const showNodeActions = hasAnalysis && !isScenarioMode && !isStrategyMode

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-subtle)]">
      {/* Left Section: Discovery */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTopicSuggestions}
          disabled={anyLoading}
          className="cw-btn cw-btn-secondary"
          title="Get AI-suggested topics to analyze"
        >
          <Lightbulb size={16} />
          <span className="hidden sm:inline">Suggest Topics</span>
        </button>

        {hasDocuments && (
          <button
            onClick={onAddContext}
            disabled={anyLoading}
            className="cw-btn cw-btn-ghost"
            title="Add context from connected sources"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Context</span>
          </button>
        )}
      </div>

      <div className="w-px h-6 bg-[var(--border-subtle)]" />

      {/* Center Section: Analysis Tools */}
      <div className="flex items-center gap-2">
        {isScenarioMode && mode.rootInput ? (
          <>
            <button
              onClick={onScenarioAnalysis}
              disabled={scenarioLoading}
              className="cw-btn cw-btn-primary"
            >
              {scenarioLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Play size={16} />
              )}
              Generate Scenarios
            </button>
          </>
        ) : showNodeActions ? (
          <>
            {/* Primary Actions - Always Visible */}
            <button
              onClick={onRerunAnalysis}
              disabled={anyLoading}
              className="cw-btn cw-btn-secondary"
              title="Regenerate analysis with fresh perspective"
            >
              <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Rerun</span>
            </button>

            <button
              onClick={onDevilsAdvocate}
              disabled={anyLoading}
              className="cw-btn cw-btn-secondary"
              title="Challenge assumptions with contrarian analysis"
            >
              {devilsAdvocateLoading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Swords size={16} />
              )}
              <span className="hidden md:inline">Devil's Advocate</span>
            </button>

            {/* More Tools Dropdown */}
            <div className="relative" ref={moreToolsRef}>
              <button
                onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                disabled={anyLoading}
                className="cw-btn cw-btn-ghost"
                title="More analysis tools"
              >
                <MoreHorizontal size={16} />
                <span className="hidden sm:inline">More Tools</span>
                <ChevronDown size={14} className={`transition-transform ${moreToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreToolsOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 rounded-lg shadow-lg z-50 overflow-hidden"
                     style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                  <div className="py-1">
                    <button
                      onClick={() => { onSteelman(); setMoreToolsOpen(false) }}
                      disabled={steelmanLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Shield size={16} style={{ color: 'var(--accent-green)' }} />
                      <div>
                        <div className="font-medium text-sm">Steelman</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Strengthen the argument</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onWargaming(); setMoreToolsOpen(false) }}
                      disabled={wargamingLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Users size={16} style={{ color: 'var(--accent-blue)' }} />
                      <div>
                        <div className="font-medium text-sm">Wargaming</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Simulate actor responses</div>
                      </div>
                    </button>

                    <button
                      onClick={() => { onGetWeird(); setMoreToolsOpen(false) }}
                      disabled={weirdLoading}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Zap size={16} style={{ color: 'var(--accent-purple)' }} />
                      <div>
                        <div className="font-medium text-sm">Get Weird</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Explore unconventional angles</div>
                      </div>
                    </button>

                    <div className="border-t border-[var(--border-subtle)] my-1" />

                    <button
                      onClick={() => { onSimulation(); setMoreToolsOpen(false) }}
                      disabled={simulationRunning}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[var(--bg-elevated)] transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <Play size={16} style={{ color: 'var(--accent-emerald)' }} />
                      <div>
                        <div className="font-medium text-sm">Simulate Future</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Multi-actor scenario simulation</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex-1" />

      {/* Right Section: Actions & Export */}
      {showNodeActions && (
        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            disabled={isSharing || anyLoading}
            className="cw-btn cw-btn-ghost"
            title="Share analysis to Slack"
          >
            {isSharing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Share2 size={16} />
            )}
            <span className="hidden sm:inline">Share</span>
          </button>

          <div className="flex items-center gap-1 px-1 py-0.5 rounded-md" style={{ background: 'var(--bg-elevated)' }}>
            <button
              onClick={onAutoLayout}
              disabled={anyLoading}
              className="p-1.5 rounded hover:bg-[var(--bg-surface)] transition-colors"
              title="Auto-arrange nodes"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Layout size={14} />
            </button>
            <button
              onClick={onFitView}
              disabled={anyLoading}
              className="p-1.5 rounded hover:bg-[var(--bg-surface)] transition-colors"
              title="Fit view to content"
              style={{ color: 'var(--text-secondary)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
              </svg>
            </button>
            {isExpertMode && currentMaxOrder < maxAllowedOrder && (
              <button
                onClick={onDeepLayer}
                disabled={isGeneratingDeepLayer || anyLoading}
                className="p-1.5 rounded hover:bg-[var(--bg-surface)] transition-colors"
                title={`Add layer ${currentMaxOrder + 1} of ${maxAllowedOrder}`}
                style={{ color: 'var(--text-secondary)' }}
              >
                {isGeneratingDeepLayer ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Layers size={14} />
                )}
              </button>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setExportMenuOpen(!exportMenuOpen)}
              disabled={anyLoading}
              className="cw-btn cw-btn-ghost"
              title="Export options"
            >
              <Download size={16} />
              <ChevronDown size={14} className={`transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-40 rounded-lg shadow-lg z-50 overflow-hidden"
                   style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                <div className="py-1">
                  <button
                    onClick={() => { onExportPowerPoint(); setExportMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[var(--bg-elevated)] transition-colors text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                      <line x1="8" y1="21" x2="16" y2="21"/>
                      <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    PowerPoint
                  </button>
                  <button
                    onClick={() => { onExportWord(); setExportMenuOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-[var(--bg-elevated)] transition-colors text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Word Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
