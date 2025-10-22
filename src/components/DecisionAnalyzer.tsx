'use client'

import React, { useState, useCallback } from 'react'
import { ReactFlow, Background, Controls, MiniMap, addEdge, Connection, useNodesState, useEdgesState } from '@xyflow/react'
import { DecisionNode, DecisionEdge, AnalysisMode, Commentary, DecisionAnalysis } from '@/types/decision'
import { InteractiveNode } from './InteractiveNode'
import { CommentaryPanel } from './CommentaryPanel'
import { ModeSelector } from './ModeSelector'
import { InputPanel } from './InputPanel'
import { DarkModeToggle } from './DarkModeToggle'
import { LayoutControls } from './LayoutControls'
import { useAutoLayout } from '@/hooks/useAutoLayout'
import { generateConsequences, generateCausalPathways, generateCommentary } from '@/services/aiService'
import '@xyflow/react/dist/style.css'

const nodeTypes = {
  interactive: InteractiveNode,
}

export default function DecisionAnalyzer() {
  const [nodes, setNodes, onNodesChange] = useNodesState<DecisionNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<DecisionEdge>([])
  const [mode, setMode] = useState<AnalysisMode>({ type: 'decision', rootInput: '' })
  const [commentary, setCommentary] = useState<Commentary[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const { recalculateLayout } = useAutoLayout()

  // React Flow instance for programmatic control
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)

  // Add event listeners for node interactions
  React.useEffect(() => {
    const handleNodeEdit = (event: CustomEvent) => {
      const { nodeId, newLabel, newDescription } = event.detail
      handleNodeEditInternal(nodeId, newLabel, newDescription)
    }

    const handleNodeAdd = (event: CustomEvent) => {
      const { parentId, nodeType, position } = event.detail
      handleNodeAddInternal(parentId, nodeType, position)
    }

    const handleNodeDelete = (event: CustomEvent) => {
      const { nodeId } = event.detail
      handleNodeDeleteInternal(nodeId)
    }

    window.addEventListener('nodeEdit', handleNodeEdit as EventListener)
    window.addEventListener('nodeAdd', handleNodeAdd as EventListener)
    window.addEventListener('nodeDelete', handleNodeDelete as EventListener)

    return () => {
      window.removeEventListener('nodeEdit', handleNodeEdit as EventListener)
      window.removeEventListener('nodeAdd', handleNodeAdd as EventListener)
      window.removeEventListener('nodeDelete', handleNodeDelete as EventListener)
    }
  }, [nodes, edges, commentary, mode])

  const onConnect = useCallback((params: Connection) => {
    const edge = { ...params, type: 'smoothstep' as const, animated: true }
    setEdges((eds) => addEdge(edge, eds) as DecisionEdge[])
  }, [setEdges])

  const handleModeChange = (newMode: 'decision' | 'forecast') => {
    setMode({ type: newMode, rootInput: '' })
    setNodes([])
    setEdges([])
    setCommentary([])
  }

  const handleAutoLayout = () => {
    recalculateLayout(nodes, setNodes)
  }

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.1 })
    }
  }

  const handleInputSubmit = async (input: string) => {
    setIsGenerating(true)
    setMode(prev => ({ ...prev, rootInput: input }))

    try {
      // Create root node
      const rootNode: DecisionNode = {
        id: 'root',
        type: 'interactive',
        data: {
          label: input,
          order: 0,
          nodeType: mode.type === 'decision' ? 'decision' : 'forecast',
        },
        position: { x: 400, y: 50 }
      }

      setNodes([rootNode])
      setEdges([])

      // Generate consequences or causal pathways based on mode
      let analysis: DecisionAnalysis
      if (mode.type === 'decision') {
        analysis = await generateConsequences(input)
      } else {
        analysis = await generateCausalPathways(input)
      }

      // Update nodes and edges with generated analysis
      setNodes(analysis.nodes)
      setEdges(analysis.edges)

      // Generate initial commentary
      const initialCommentary = await generateCommentary(analysis, 'initialAnalysis', [])
      setCommentary([initialCommentary])

    } catch (error) {
      console.error('Error generating analysis:', error)
      // Add error commentary
      const errorCommentary: Commentary = {
        id: `error-${Date.now()}`,
        content: 'An error occurred while generating the analysis. Please try again.',
        timestamp: new Date(),
        triggeredBy: 'initialAnalysis',
        relatedNodes: []
      }
      setCommentary([errorCommentary])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNodeEditInternal = async (nodeId: string, newLabel: string, newDescription?: string) => {
    // Update the node
    const updatedNodes = nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
              description: newDescription,
              isEditing: false
            }
          }
        : node
    )

    // Recalculate layout to handle size changes
    recalculateLayout(updatedNodes, setNodes)

    // Generate updated commentary
    try {
      const currentAnalysis: DecisionAnalysis = {
        nodes,
        edges,
        commentary,
        mode
      }

      const updatedCommentary = await generateCommentary(currentAnalysis, 'nodeEdit', [nodeId])
      setCommentary(prev => [...prev, updatedCommentary])
    } catch (error) {
      console.error('Error generating commentary:', error)
    }
  }

  const handleNodeAddInternal = async (parentId: string, nodeType: 'consequence' | 'forecast', position: { x: number; y: number }) => {
    const newNodeId = `node-${Date.now()}`
    const parentNode = nodes.find(n => n.id === parentId)
    const newOrder = parentNode ? parentNode.data.order + 1 : 1

    const newNode: DecisionNode = {
      id: newNodeId,
      type: 'interactive',
      data: {
        label: 'New consequence',
        order: newOrder,
        nodeType: nodeType,
        isEditing: true
      },
      position
    }

    const newEdge: DecisionEdge = {
      id: `edge-${parentId}-${newNodeId}`,
      source: parentId,
      target: newNodeId,
      type: 'smoothstep',
      animated: true
    }

    const updatedNodes = [...nodes, newNode]
    const updatedEdges = [...edges, newEdge]

    // Apply auto-layout to prevent overlaps
    recalculateLayout(updatedNodes, setNodes)
    setEdges(updatedEdges)

    // Generate commentary for the addition
    try {
      const currentAnalysis: DecisionAnalysis = {
        nodes: [...nodes, newNode],
        edges: [...edges, newEdge],
        commentary,
        mode
      }

      const addCommentary = await generateCommentary(currentAnalysis, 'nodeAdd', [newNodeId])
      setCommentary(prev => [...prev, addCommentary])
    } catch (error) {
      console.error('Error generating commentary:', error)
    }
  }

  const handleNodeDeleteInternal = async (nodeId: string) => {
    const nodeToDelete = nodes.find(n => n.id === nodeId)
    if (!nodeToDelete || nodeToDelete.data.order === 0) return // Don't delete root node

    const updatedNodes = nodes.filter(n => n.id !== nodeId)
    const updatedEdges = edges.filter(e => e.source !== nodeId && e.target !== nodeId)

    // Recalculate layout after deletion
    recalculateLayout(updatedNodes, setNodes)
    setEdges(updatedEdges)

    // Generate commentary for the deletion
    try {
      const currentAnalysis: DecisionAnalysis = {
        nodes: nodes.filter(n => n.id !== nodeId),
        edges: edges.filter(e => e.source !== nodeId && e.target !== nodeId),
        commentary,
        mode
      }

      const deleteCommentary = await generateCommentary(currentAnalysis, 'nodeDelete', [nodeId])
      setCommentary(prev => [...prev, deleteCommentary])
    } catch (error) {
      console.error('Error generating commentary:', error)
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claudeswitz
            </h1>
            <DarkModeToggle />
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <ModeSelector
              currentMode={mode.type}
              onModeChange={handleModeChange}
            />
            <InputPanel
              mode={mode.type}
              onSubmit={handleInputSubmit}
              isGenerating={isGenerating}
            />
            {nodes.length > 0 && (
              <LayoutControls
                onAutoLayout={handleAutoLayout}
                onFitView={handleFitView}
                isGenerating={isGenerating}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Graph Area */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
        </div>

        {/* Commentary Panel */}
        <div className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <CommentaryPanel
            commentary={commentary}
            mode={mode}
          />
        </div>
      </div>
    </div>
  )
}