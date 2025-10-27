'use client'

import React, { useState } from 'react'
import { Plus, Loader2, X, Check } from 'lucide-react'

interface AddNodeButtonProps {
  onAddNode: (label: string, description: string, parentId?: string) => void
  isGenerating: boolean
  disabled?: boolean
  availableParents: Array<{ id: string; label: string; order: number }>
}

export function AddNodeButton({ onAddNode, isGenerating, disabled, availableParents }: AddNodeButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [selectedParent, setSelectedParent] = useState<string>('')

  const handleStartAdd = () => {
    setIsAdding(true)
    setNewLabel('')
    setNewDescription('')
    setSelectedParent(availableParents.length > 0 ? availableParents[0].id : '')
  }

  const handleSaveNode = () => {
    if (newLabel.trim()) {
      onAddNode(newLabel.trim(), newDescription.trim(), selectedParent || undefined)
      setIsAdding(false)
      setNewLabel('')
      setNewDescription('')
      setSelectedParent('')
    }
  }

  const handleCancel = () => {
    setIsAdding(false)
    setNewLabel('')
    setNewDescription('')
    setSelectedParent('')
  }

  if (isAdding) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Add New Node</h3>

        <div className="space-y-3">
          {/* Parent Selection */}
          {availableParents.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Connect to Parent:
              </label>
              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Add as new branch</option>
                {availableParents.map(parent => (
                  <option key={parent.id} value={parent.id}>
                    {parent.label} (Order {parent.order})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Label Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Node Title:
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter consequence or cause title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (optional):
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Add detailed description..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveNode}
              disabled={!newLabel.trim() || isGenerating}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm font-medium transition-colors"
            >
              <Check size={14} />
              Add Node
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleStartAdd}
      disabled={disabled || isGenerating}
      className="flex items-center gap-2 px-4 py-2 bg-gray-600 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
      title="Manually add a new node to the analysis"
    >
      {isGenerating ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <Plus size={16} />
          Add Node
        </>
      )}
    </button>
  )
}