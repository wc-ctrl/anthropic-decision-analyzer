'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { DecisionNode } from '@/types/decision'
import { Edit3, Plus, Trash2, Check, X } from 'lucide-react'
import { calculateNodeDimensions } from '@/utils/layoutUtils'

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th']
  return num > 3 ? 'th' : suffixes[num] || 'th'
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
      // This would trigger the parent component's handleNodeEdit
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
        position: { x: 0, y: 100 } // Relative position, will be adjusted
      }
    }))
  }

  const handleDelete = () => {
    if (data.order > 0) { // Don't delete root node
      window.dispatchEvent(new CustomEvent('nodeDelete', {
        detail: { nodeId: id }
      }))
    }
  }

  const getNodeStylesAndDimensions = () => {
    // Calculate dynamic dimensions
    const dimensions = calculateNodeDimensions({ data, id, type: 'interactive', position: { x: 0, y: 0 } })

    const baseClasses = "rounded-lg border-2 shadow-md bg-white dark:bg-gray-800"

    const style = {
      width: `${dimensions.width}px`,
      height: `${dimensions.height}px`,
      minWidth: `${dimensions.width}px`,
      minHeight: `${dimensions.height}px`
    }

    let borderClasses
    switch (data.order) {
      case 0: // Root node
        borderClasses = "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
        break
      case 1: // First order
        borderClasses = "border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20"
        break
      case 2: // Second order
        borderClasses = "border-orange-500 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/20"
        break
      case 3: // Third order
        borderClasses = "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
        break
      case 4: // Fourth order
        borderClasses = "border-pink-500 dark:border-pink-400 bg-pink-50 dark:bg-pink-900/20"
        break
      case 5: // Fifth order
        borderClasses = "border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
        break
      case 6: // Sixth order
        borderClasses = "border-teal-500 dark:border-teal-400 bg-teal-50 dark:bg-teal-900/20"
        break
      default:
        borderClasses = "border-gray-300 dark:border-gray-600"
    }

    return {
      className: `${baseClasses} ${borderClasses}`,
      style,
      dimensions
    }
  }

  const { className, style, dimensions } = getNodeStylesAndDimensions()

  return (
    <div className={className} style={style}>
      {/* Input handles */}
      {data.order > 0 && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 bg-gray-400"
        />
      )}

      {/* Node content */}
      <div className="p-4">
        {/* Header with order indicator */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {data.order === 0 ? 'Root' : `${data.order}${getOrdinalSuffix(data.order)} Order`}
          </span>
          <div className="flex gap-1">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300"
                  title="Edit node"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={handleAddChild}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-600 dark:text-gray-300"
                  title="Add consequence"
                >
                  <Plus size={12} />
                </button>
                {data.order > 0 && (
                  <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-red-200 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400"
                    title="Delete node"
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
                  className="p-1 hover:bg-green-200 dark:hover:bg-green-900/30 rounded transition-colors text-green-600 dark:text-green-400"
                  title="Save changes"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-red-200 dark:hover:bg-red-900/30 rounded transition-colors text-red-600 dark:text-red-400"
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
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter consequence or cause..."
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add description (optional)..."
              className="w-full p-2 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <div className="font-medium text-sm text-gray-900 dark:text-white leading-tight mb-1">
              {data.label}
            </div>
            {data.description && (
              <div className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
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
        className="w-3 h-3 bg-gray-400"
      />
    </div>
  )
}