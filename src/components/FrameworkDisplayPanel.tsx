'use client'

import React from 'react'
import { LayoutGrid, Lightbulb } from 'lucide-react'
import { PopulatedFramework } from '@/types/framework'
import { FrameworkDefinition } from '@/types/framework'

interface FrameworkDisplayPanelProps {
  data: PopulatedFramework | null
  framework: FrameworkDefinition | null
  loading: boolean
}

export function FrameworkDisplayPanel({ data, framework, loading }: FrameworkDisplayPanelProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 mx-auto mb-4"
            style={{ border: '2px solid var(--accent-gold)', borderTopColor: 'transparent' }}
          />
          <p className="text-lg" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
            Applying {framework?.name || 'framework'}...
          </p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            Claude is analyzing with {framework?.fields.length || 0} dimensions
          </p>
        </div>
      </div>
    )
  }

  if (!data || !framework) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <LayoutGrid size={64} className="mx-auto mb-4" style={{ color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>
            Select a framework and provide a case to analyze
          </p>
        </div>
      </div>
    )
  }

  const renderContent = (content: string) => {
    const lines = content.split('\n').filter(l => l.trim())
    return (
      <ul className="space-y-1.5">
        {lines.map((line, i) => (
          <li key={i} className="text-sm leading-relaxed flex gap-2" style={{ color: 'var(--text-secondary)' }}>
            <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ background: 'var(--accent-gold)' }} />
            <span>{line.replace(/^[-•*]\s*/, '')}</span>
          </li>
        ))}
      </ul>
    )
  }

  const layout = framework.layout
  const fields = framework.fields

  const renderGrid2x2 = () => (
    <div className="grid grid-cols-2 gap-4">
      {fields.map(field => (
        <div
          key={field.id}
          className="p-4 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h4
            className="text-sm font-semibold mb-3 pb-2"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {field.label}
          </h4>
          {data.fields[field.id] ? renderContent(data.fields[field.id]) : (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No data</p>
          )}
        </div>
      ))}
    </div>
  )

  const renderGrid3x2 = () => (
    <div className="grid grid-cols-3 gap-4">
      {fields.map(field => (
        <div
          key={field.id}
          className="p-4 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h4
            className="text-sm font-semibold mb-3 pb-2"
            style={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            {field.label}
          </h4>
          {data.fields[field.id] ? renderContent(data.fields[field.id]) : (
            <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No data</p>
          )}
        </div>
      ))}
    </div>
  )

  const renderPorter = () => {
    const center = fields.find(f => f.id === 'rivalry')
    const surrounding = fields.filter(f => f.id !== 'rivalry')

    return (
      <div className="relative" style={{ minHeight: '500px' }}>
        {/* Center */}
        {center && (
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 p-4 rounded-lg z-10"
            style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)' }}
          >
            <h4
              className="text-sm font-semibold mb-3 pb-2 text-center"
              style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
            >
              {center.label}
            </h4>
            {data.fields[center.id] ? renderContent(data.fields[center.id]) : null}
          </div>
        )}
        {/* Surrounding forces */}
        <div className="grid grid-cols-2 gap-4" style={{ minHeight: '500px' }}>
          {surrounding.map((field, i) => (
            <div
              key={field.id}
              className={`p-4 rounded-lg ${i >= 2 ? 'col-span-1' : ''}`}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h4
                className="text-sm font-semibold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {field.label}
              </h4>
              {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSevenS = () => {
    const center = fields.find(f => f.id === 'sharedValues')
    const hard = fields.filter(f => ['strategy', 'structure', 'systems'].includes(f.id))
    const soft = fields.filter(f => ['style', 'staff', 'skills'].includes(f.id))

    return (
      <div className="space-y-4">
        {/* Hard Ss */}
        <div className="grid grid-cols-3 gap-4">
          {hard.map(field => (
            <div
              key={field.id}
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h4
                className="text-sm font-semibold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {field.label} (Hard)
              </h4>
              {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
            </div>
          ))}
        </div>
        {/* Shared Values (Center) */}
        {center && (
          <div
            className="p-4 rounded-lg max-w-md mx-auto"
            style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-gold)' }}
          >
            <h4
              className="text-sm font-semibold mb-3 pb-2 text-center"
              style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
            >
              {center.label}
            </h4>
            {data.fields[center.id] ? renderContent(data.fields[center.id]) : null}
          </div>
        )}
        {/* Soft Ss */}
        <div className="grid grid-cols-3 gap-4">
          {soft.map(field => (
            <div
              key={field.id}
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h4
                className="text-sm font-semibold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {field.label} (Soft)
              </h4>
              {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderValueChain = () => {
    const primary = fields.filter(f =>
      ['inboundLogistics', 'operations', 'outboundLogistics', 'marketing', 'service'].includes(f.id)
    )
    const support = fields.filter(f =>
      ['infrastructure', 'hrm', 'technology', 'procurement'].includes(f.id)
    )

    return (
      <div className="space-y-4">
        {/* Support Activities */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
          >
            Support Activities
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {support.map(field => (
              <div
                key={field.id}
                className="p-3 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <h4
                  className="text-sm font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {field.label}
                </h4>
                {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
              </div>
            ))}
          </div>
        </div>
        {/* Primary Activities */}
        <div>
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-3"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}
          >
            Primary Activities
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {primary.map(field => (
              <div
                key={field.id}
                className="p-3 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <h4
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {field.label}
                </h4>
                {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderCanvas = () => {
    // Business Model Canvas / Lean Canvas layout
    // Top row: 5 columns | Bottom row: 2 columns
    const topFields = fields.slice(0, Math.min(7, fields.length))
    const bottomFields = fields.slice(Math.min(7, fields.length))

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-3">
          {topFields.map(field => (
            <div
              key={field.id}
              className="p-3 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h4
                className="text-xs font-semibold mb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
              >
                {field.label}
              </h4>
              {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
            </div>
          ))}
        </div>
        {bottomFields.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {bottomFields.map(field => (
              <div
                key={field.id}
                className="p-3 rounded-lg"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
              >
                <h4
                  className="text-xs font-semibold mb-2"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                >
                  {field.label}
                </h4>
                {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderFiveWhys = () => (
    <div className="space-y-3 max-w-2xl mx-auto">
      {fields.map((field, i) => (
        <div key={field.id} className="relative">
          <div
            className="p-4 rounded-lg"
            style={{
              background: 'var(--bg-surface)',
              border: i === fields.length - 2 ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
            }}
          >
            <h4
              className="text-sm font-semibold mb-2"
              style={{
                color: i === fields.length - 2 ? 'var(--accent-gold)' : 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
              }}
            >
              {field.label}
            </h4>
            {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
          </div>
          {i < fields.length - 1 && (
            <div className="flex justify-center py-1">
              <div className="w-0.5 h-4" style={{ background: 'var(--border-medium)' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )

  const renderGap = () => {
    const top = fields.filter(f => ['currentState', 'desiredState'].includes(f.id))
    const bottom = fields.filter(f => ['gaps', 'actions'].includes(f.id))

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {top.map(field => (
            <div
              key={field.id}
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h4
                className="text-sm font-semibold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {field.label}
              </h4>
              {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
            </div>
          ))}
        </div>
        <div
          className="text-center py-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}
        >
          Gap Analysis
        </div>
        <div className="grid grid-cols-2 gap-4">
          {bottom.map(field => (
            <div
              key={field.id}
              className="p-4 rounded-lg"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <h4
                className="text-sm font-semibold mb-3 pb-2"
                style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
              >
                {field.label}
              </h4>
              {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderThreeColumns = () => (
    <div className="grid grid-cols-3 gap-4">
      {fields.map(field => (
        <div
          key={field.id}
          className="p-4 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h4
            className="text-sm font-semibold mb-3 pb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            {field.label}
          </h4>
          {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
        </div>
      ))}
    </div>
  )

  const renderGeneric = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {fields.map(field => (
        <div
          key={field.id}
          className="p-4 rounded-lg"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
        >
          <h4
            className="text-sm font-semibold mb-3 pb-2"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', borderBottom: '1px solid var(--border-subtle)' }}
          >
            {field.label}
          </h4>
          {data.fields[field.id] ? renderContent(data.fields[field.id]) : null}
        </div>
      ))}
    </div>
  )

  const renderLayout = () => {
    switch (layout) {
      case 'grid-2x2': return renderGrid2x2()
      case 'grid-3x2': return renderGrid3x2()
      case 'porter': return renderPorter()
      case 'seven-s': return renderSevenS()
      case 'value-chain': return renderValueChain()
      case 'canvas': return renderCanvas()
      case 'five-whys': return renderFiveWhys()
      case 'gap': return renderGap()
      case 'three-columns': return renderThreeColumns()
      default: return renderGeneric()
    }
  }

  return (
    <div className="h-full overflow-auto p-6" style={{ background: 'var(--bg-deep)' }}>
      {/* Framework Header */}
      <div
        className="mb-6 rounded-lg p-4"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--accent-gold)',
        }}
      >
        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid size={24} style={{ color: 'var(--accent-gold)' }} />
          <h2
            className="text-xl font-semibold"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {data.frameworkName}
          </h2>
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          {data.caseDescription}
        </p>
      </div>

      {/* Framework Content */}
      {renderLayout()}

      {/* Recommendation */}
      {data.recommendation && (
        <div
          className="mt-6 p-4 rounded-lg"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--accent-gold)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={18} style={{ color: 'var(--accent-gold)' }} />
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}
            >
              Strategic Recommendation
            </h3>
          </div>
          {renderContent(data.recommendation)}
        </div>
      )}
    </div>
  )
}
