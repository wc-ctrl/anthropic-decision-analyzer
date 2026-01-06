'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { DecisionNode } from '@/types/decision'
import { Edit3, Plus, Trash2, Check, X, TrendingUp, TrendingDown, Minus, ZoomIn } from 'lucide-react'
import { calculateNodeDimensions } from '@/utils/layoutUtils'

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th']
  return num > 3 ? 'th' : suffixes[num] || 'th'
}

function getSentimentIcon(sentiment: 'positive' | 'negative' | 'neutral' | undefined) {
  switch (sentiment) {
    case 'positive':
      return <TrendingUp size={14} className="text-emerald-400" title="Positive impact" />
    case 'negative':
      return <TrendingDown size={14} className="text-rose-400" title="Negative impact" />
    case 'neutral':
      return <Minus size={14} className="text-[var(--text-muted)]" title="Neutral impact" />
    default:
      return null
  }
}

// Strategic color palette for node tiers
const tierStyles: Record<number, { border: string; bg: string; accent: string }> = {
  0: { border: 'border-[var(--accent-gold)]', bg: 'bg-[var(--accent-gold-glow)]', accent: 'text-[var(--accent-gold)]' },
  1: { border: 'border-[var(--accent-teal)]', bg: 'bg-[rgba(77,182,172,0.1)]', accent: 'text-[var(--accent-teal)]' },
  2: { border: 'border-[var(--accent-coral)]', bg: 'bg-[rgba(224,122,95,0.1)]', accent: 'text-[var(--accent-coral)]' },
  3: { border: 'border-[var(--accent-violet)]', bg: 'bg-[rgba(159,122,234,0.1)]', accent: 'text-[var(--accent-violet)]' },
  4: { border: 'border-amber-400', bg: 'bg-amber-400/10', accent: 'text-amber-400' },
  5: { border: 'border-cyan-400', bg: 'bg-cyan-400/10', accent: 'text-cyan-400' },
  6: { border: 'border-pink-400', bg: 'bg-pink-400/10', accent: 'text-pink-400' },
}

export function InteractiveNode({ data, id }: NodeProps<DecisionNode>) {
  const [isEditing, setIsEditing] = useState(data.isEditing || false)
  const [editValue, setEditValue] = useState(data.label)
  const [editDescription, setEditDescription] = useState(data.description || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  useEffect(() => {
    setIsEditing(data.isEditing || false)
  }, [data.isEditing])

  const handleSave = () => {
    if (editValue.trim()) {
      window.dispatchEvent(new CustomEvent('nodeEdit', {
        detail: { nodeId: id, newLabel: editValue.trim(), newDescription: editDescription.trim() }
      }))
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditValue(data.label)
    setEditDescription(data.description || '')
    setIsEditing(false)
  }

  const handleAddChild = () => {
    window.dispatchEvent(new CustomEvent('nodeAdd', {
      detail: {
        parentId: id,
        nodeType: data.nodeType === 'decision' ? 'consequence' : 'forecast',
        position: { x: 0, y: 100 }
      }
    }))
  }

  const handleDelete = () => {
    if (data.order > 0) {
      window.dispatchEvent(new CustomEvent('nodeDelete', {
        detail: { nodeId: id }
      }))
    }
  }

  const handleDeepDive = () => {
    window.dispatchEvent(new CustomEvent('nodeDrillDown', {
      detail: { nodeId: id, nodeData: data }
    }))
  }

  const handleDoubleClick = () => {
    handleDeepDive()
  }

  const getNodeStylesAndDimensions = () => {
    const dimensions = calculateNodeDimensions({ data, id, type: 'interactive', position: { x: 0, y: 0 } })
    const tier = tierStyles[data.order] || tierStyles[6]

    const style = {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      minWidth: `${dimensions.width}px`,
      minHeight: `${dimensions.height}px`
    }

    return {
      tier,
      style,
      dimensions
    }
  }

  const { tier, style, dimensions } = getNodeStylesAndDimensions()

  return (
    <div
      className={`
        rounded-xl border-2 ${tier.border} ${tier.bg}
        bg-[var(--bg-surface)] backdrop-blur-sm
        shadow-[var(--shadow-soft)]
        transition-all duration-200
        hover:shadow-[var(--shadow-medium)]
        hover:scale-[1.02]
        cursor-pointer
      `}
      style={style}
      onDoubleClick={handleDoubleClick}
      title={data.order > 0 ? "Double-click to drill down" : undefined}
    >
      {/* Input handles */}
      {data.order > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !bg-[var(--accent-gold)] !border-2 !border-[var(--bg-surface)]"
        />
      )}

      {/* Node content */}
      <div className="p-4">
        {/* Header with order indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${tier.accent}`}>
              {data.order === 0 ? 'Decision' : `${data.order}${getOrdinalSuffix(data.order)} Order`}
            </span>
            {data.order > 0 && getSentimentIcon(data.sentiment)}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isEditing && (
              <>
                <button
                  onClick={handleDeepDive}
                  className="p-1.5 hover:bg-[var(--accent-violet)]/20 rounded-md transition-colors text-[var(--accent-violet)]"
                  title="Deep Dive"
                >
                  <ZoomIn size={12} />
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-[var(--bg-hover)] rounded-md transition-colors text-[var(--text-secondary)]"
                  title="Edit"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={handleAddChild}
                  className="p-1.5 hover:bg-[var(--accent-teal)]/20 rounded-md transition-colors text-[var(--accent-teal)]"
                  title="Add consequence"
                >
                  <Plus size={12} />
                </button>
                {data.order > 0 && (
                  <button
                    onClick={handleDelete}
                    className="p-1.5 hover:bg-[var(--accent-coral)]/20 rounded-md transition-colors text-[var(--accent-coral)]"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="p-1.5 hover:bg-emerald-500/20 rounded-md transition-colors text-emerald-400"
                  title="Save"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1.5 hover:bg-rose-500/20 rounded-md transition-colors text-rose-400"
                  title="Cancel"
                >
                  <X size={12} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main content */}
        {isEditing ? (
          <div className="space-y-2">
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
              className="cw-input w-full text-sm"
              placeholder="Enter consequence..."
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add description (optional)..."
              className="cw-input w-full text-xs resize-none"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <div className="font-medium text-sm text-[var(--text-primary)] leading-tight mb-1.5" style={{ fontFamily: 'var(--font-display)' }}>
              {data.label}
              {data.probability && data.nodeType === 'forecast' && (
                <span className="ml-2 text-xs font-mono font-bold bg-[var(--bg-elevated)] px-2 py-0.5 rounded-md text-[var(--accent-gold)]">
                  {data.probability}%
                </span>
              )}
            </div>
            {data.description && (
              <div className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {data.description}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[var(--accent-gold)] !border-2 !border-[var(--bg-surface)]"
      />
    </div>
  )
}
