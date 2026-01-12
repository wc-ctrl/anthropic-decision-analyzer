'use client'

import React, { useState, useCallback } from 'react'
import { X, Save, Loader2, ZoomIn, ArrowLeft } from 'lucide-react'
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react'
import { DecisionNode, DecisionEdge, AnalysisMode, Commentary } from '@/types/decision'
import { InteractiveNode } from './InteractiveNode'
import { CommentaryPanel } from './CommentaryPanel'
import { useAutoLayout } from '@/hooks/useAutoLayout'
import { generateCommentary } from '@/services/aiService'

interface DrillDownModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (insights: DrillDownInsights) => void
  focusNode: DecisionNode | null
  parentAnalysisType: 'decision' | 'forecast' | 'scenario' | 'strategy'
  isExpertMode: boolean
}

interface DrillDownInsights {
  focusNodeId: string
  subAnalysis: {
    nodes: DecisionNode[]
    edges: DecisionEdge[]
    commentary: Commentary[]
  }
  propagationSuggestions: Array<{
    targetNodeId: string
    suggestedUpdate: string
    rationale: string
  }>
  strategicImplications: string
}

const nodeTypes = {
  interactive: InteractiveNode,
}

export function DrillDownModal({
  isOpen,
  onClose,
  onSave,
  focusNode,
  parentAnalysisType,
  isExpertMode
}: DrillDownModalProps) {
  const [subNodes, setSubNodes, onSubNodesChange] = useNodesState<DecisionNode>([])
  const [subEdges, setSubEdges, onSubEdgesChange] = useEdgesState<DecisionEdge>([])
  const [subCommentary, setSubCommentary] = useState<Commentary[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)
  const { recalculateLayout } = useAutoLayout()

  const onConnect = useCallback((params: Connection) => {
    const edge = { ...params, type: 'smoothstep' as const, animated: true }
    setSubEdges((eds) => addEdge(edge, eds) as DecisionEdge[])
  }, [setSubEdges])

  // Generate analysis commentary when modal opens (without generating new tree)
  React.useEffect(() => {
    if (isOpen && focusNode && subCommentary.length === 0) {
      generateAnalysisCommentary()
    }
  }, [isOpen, focusNode])

  const generateAnalysisCommentary = async () => {
    if (!focusNode) return

    setIsGenerating(true)

    try {
      // Display the focus node in the center without children
      const centerNode: DecisionNode = {
        ...focusNode,
        position: { x: 400, y: 200 }
      }
      setSubNodes([centerNode])
      setSubEdges([])

      // Generate deep analysis commentary for this node
      const analysis = {
        nodes: [centerNode],
        edges: [],
        commentary: [],
        mode: { type: parentAnalysisType, rootInput: focusNode.data.label }
      }

      const commentary = await generateCommentary(
        analysis,
        `Deep dive on "${focusNode.data.label}"`,
        [focusNode.id]
      )

      setSubCommentary([commentary])

      // Auto-fit the view
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2 })
        }
      }, 500)

    } catch (error) {
      console.error('Error generating deep dive analysis:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveAndPropagate = async () => {
    if (!focusNode) return

    setIsSaving(true)

    try {
      // Generate propagation insights
      const response = await fetch('/api/propagate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusNode,
          subAnalysis: {
            nodes: subNodes,
            edges: subEdges,
            commentary: subCommentary
          },
          parentAnalysisType,
          isExpertMode
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate propagation insights')
      }

      const insights = await response.json()

      const drillDownInsights: DrillDownInsights = {
        focusNodeId: focusNode.id,
        subAnalysis: {
          nodes: subNodes,
          edges: subEdges,
          commentary: subCommentary
        },
        propagationSuggestions: insights.propagationSuggestions || [],
        strategicImplications: insights.strategicImplications || 'Deep dive insights generated'
      }

      onSave(drillDownInsights)
      onClose()

    } catch (error) {
      console.error('Error saving drill-down insights:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setSubNodes([])
    setSubEdges([])
    setSubCommentary([])
    generateSubAnalysis()
  }

  if (!isOpen || !focusNode) return null

  const getAnalysisTitle = () => {
    switch (parentAnalysisType) {
      case 'decision': return 'Consequence Deep Dive'
      case 'forecast': return 'Causal Factor Deep Dive'
      case 'scenario': return 'Scenario Element Deep Dive'
      case 'strategy': return 'Strategic Element Deep Dive'
      default: return 'Deep Dive Analysis'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <ZoomIn size={24} className="text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                {getAnalysisTitle()}
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Analyzing: "{focusNode.data.label}"
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isGenerating || isSaving}
              className="px-3 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSaveAndPropagate}
              disabled={isGenerating || isSaving || subNodes.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save & Update Main Tree
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(95vh-80px)]">
          {/* Sub-Analysis Graph */}
          <div className="flex-1">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    Generating focused analysis for "{focusNode.data.label}"...
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                    Creating {isExpertMode ? '5→2' : '3→1'} sub-tree
                  </p>
                </div>
              </div>
            ) : (
              <ReactFlow
                nodes={subNodes}
                edges={subEdges}
                onNodesChange={onSubNodesChange}
                onEdgesChange={onSubEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onInit={setReactFlowInstance}
                fitView
                className="bg-gray-50 dark:bg-gray-900"
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            )}
          </div>

          {/* Sub-Commentary Panel */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Deep Dive Commentary
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Focused analysis of selected node
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {subCommentary.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                    <ZoomIn size={48} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm">
                      Deep dive commentary will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-4">
                    {subCommentary.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-700 p-3"
                      >
                        <div className="prose prose-sm max-w-none">
                          {comment.content.split('\n').map((line, index) => {
                            const trimmedLine = line.trim()
                            if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
                              return (
                                <h4 key={index} className="font-semibold text-blue-900 dark:text-blue-100 mt-3 mb-2 first:mt-0">
                                  {trimmedLine.replace(/\*\*/g, '')}
                                </h4>
                              )
                            } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                              return (
                                <div key={index} className="flex items-start gap-2 mb-1">
                                  <span className="text-blue-600 dark:text-blue-400 font-bold mt-1">•</span>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed flex-1">
                                    {trimmedLine.replace(/^[•-]\s*/, '')}
                                  </p>
                                </div>
                              )
                            } else if (trimmedLine.length > 0) {
                              return (
                                <p key={index} className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed mb-2">
                                  {trimmedLine}
                                </p>
                              )
                            }
                            return null
                          }).filter(Boolean)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                    <ZoomIn size={12} />
                    <span className="font-medium">Deep Dive Mode: Analyzing "{focusNode.data.label}"</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                    <ArrowLeft size={12} />
                    <span>Changes will update main tree when saved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}