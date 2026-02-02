'use client'

import React, { useState, useMemo } from 'react'
import { Search, ChevronDown, ChevronRight } from 'lucide-react'
import { Zap } from 'lucide-react'
import { FrameworkDefinition } from '@/types/framework'
import { frameworks, getFrameworksByCategory, getCategories, getFeaturedFrameworks } from '@/data/frameworkDefinitions'

interface FrameworkPickerProps {
  onSelect: (framework: FrameworkDefinition) => void
}

export function FrameworkPicker({ onSelect }: FrameworkPickerProps) {
  const [search, setSearch] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const categories = useMemo(() => getCategories(), [])
  const grouped = useMemo(() => getFrameworksByCategory(), [])
  const featured = useMemo(() => getFeaturedFrameworks(), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped

    const q = search.toLowerCase()
    const result: Record<string, FrameworkDefinition[]> = {}

    for (const fw of frameworks) {
      if (
        fw.name.toLowerCase().includes(q) ||
        fw.description.toLowerCase().includes(q) ||
        fw.category.toLowerCase().includes(q)
      ) {
        if (!result[fw.category]) result[fw.category] = []
        result[fw.category].push(fw)
      }
    }
    return result
  }, [search, grouped])

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const totalCount = Object.values(filtered).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="h-full overflow-auto p-6" style={{ background: 'var(--bg-deep)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            Consulting Frameworks
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Select a framework to apply to your analysis ({frameworks.length} frameworks available)
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-lg mx-auto">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search frameworks..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)',
            }}
          />
          {search && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              {totalCount} result{totalCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Featured / Quick Start */}
        {!search.trim() && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} style={{ color: 'var(--accent-gold)' }} />
              <h3
                className="text-sm font-semibold uppercase tracking-wider"
                style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}
              >
                Quick Start
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {featured.map(fw => (
                <button
                  key={fw.id}
                  onClick={() => onSelect(fw)}
                  className="text-left p-4 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '2px solid var(--accent-gold)',
                    boxShadow: '0 0 12px rgba(var(--accent-gold-rgb, 212 175 55), 0.15)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 175, 55, 0.15)'
                  }}
                >
                  <h4
                    className="font-medium text-sm mb-1"
                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                  >
                    {fw.name}
                  </h4>
                  <p
                    className="text-xs leading-relaxed line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {fw.description}
                  </p>
                  <div className="mt-2 flex items-center gap-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                    >
                      {fw.fields.length} dimensions
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          {categories.map(category => {
            const catFrameworks = filtered[category]
            if (!catFrameworks || catFrameworks.length === 0) return null

            const isCollapsed = collapsedCategories.has(category)

            return (
              <div key={category}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex items-center gap-2 mb-3 group cursor-pointer w-full text-left"
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
                  ) : (
                    <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                  )}
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}
                  >
                    {category}
                  </h3>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                  >
                    {catFrameworks.length}
                  </span>
                </button>

                {/* Framework Cards */}
                {!isCollapsed && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
                    {catFrameworks.map(fw => (
                      <button
                        key={fw.id}
                        onClick={() => onSelect(fw)}
                        className="text-left p-4 rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                        style={{
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-gold)'
                          e.currentTarget.style.boxShadow = 'var(--shadow-glow)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        <h4
                          className="font-medium text-sm mb-1"
                          style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                        >
                          {fw.name}
                        </h4>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {fw.description}
                        </p>
                        <div className="mt-2 flex items-center gap-1">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                          >
                            {fw.fields.length} dimensions
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          {totalCount === 0 && (
            <div className="text-center py-12">
              <p style={{ color: 'var(--text-muted)' }}>
                No frameworks match &quot;{search}&quot;
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
