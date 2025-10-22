'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { DecisionNode } from '@/types/decision'
import { Edit3, Plus, Trash2, Check, X } from 'lucide-react'

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

  const getNodeStyles = () => {
    const baseStyles = "min-w-[200px] max-w-[300px] rounded-lg border-2 shadow-md bg-white"

    switch (data.order) {
      case 0: // Root node
        return `${baseStyles} border-blue-500 bg-blue-50`
      case 1: // First order
        return `${baseStyles} border-green-500 bg-green-50`
      case 2: // Second order
        return `${baseStyles} border-orange-500 bg-orange-50`
      default:
        return `${baseStyles} border-gray-300`
    }
  }

  return (
    <div className={getNodeStyles()}>
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
          <span className="text-xs font-medium text-gray-500">
            {data.order === 0 ? 'Root' : `${data.order}${data.order === 1 ? 'st' : 'nd'} Order`}
          </span>
          <div className="flex gap-1">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Edit node"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={handleAddChild}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Add consequence"
                >
                  <Plus size={12} />
                </button>
                {data.order > 0 && (
                  <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-red-200 rounded transition-colors text-red-600"
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
                  className="p-1 hover:bg-green-200 rounded transition-colors text-green-600"
                  title="Save changes"
                >
                  <Check size={12} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 hover:bg-red-200 rounded transition-colors text-red-600"
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
              className="w-full p-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter consequence or cause..."
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add description (optional)..."
              className="w-full p-2 text-xs border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <div className="font-medium text-sm text-gray-900 leading-tight mb-1">
              {data.label}
            </div>
            {data.description && (
              <div className="text-xs text-gray-600 leading-relaxed">
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