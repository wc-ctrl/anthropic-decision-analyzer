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
import { DeepLayerButton } from './DeepLayerButton'
import { McpIntegrationPanel } from './McpIntegrationPanel'
import { RerunAnalysisButton } from './RerunAnalysisButton'
import { DevilsAdvocateButton } from './DevilsAdvocateButton'
import { DevilsAdvocateModal } from './DevilsAdvocateModal'
import { ScenarioButton } from './ScenarioButton'
import { ScenarioAnalysisModal } from './ScenarioAnalysisModal'
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
  const [isGeneratingDeepLayer, setIsGeneratingDeepLayer] = useState(false)
  const [hasSlackData, setHasSlackData] = useState(false)
  const [hasGDriveData, setHasGDriveData] = useState(false)
  const [devilsAdvocateModal, setDevilsAdvocateModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const [scenarioModal, setScenarioModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const { recalculateLayout } = useAutoLayout()

  // React Flow instance for programmatic control
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null)

  // Calculate current max order and allowed max order
  const currentMaxOrder = nodes.length > 0 ? Math.max(...nodes.map(n => n.data.order)) : 0
  const maxAllowedOrder = 6 // Root (0) + 6 layers = 7 total tiers

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

  const handleModeChange = (newMode: 'decision' | 'forecast' | 'scenario') => {
    setMode({ type: newMode, rootInput: '' })
    setNodes([])
    setEdges([])
    setCommentary([])
  }

  const handleAutoLayout = () => {
    recalculateLayout(nodes, setNodes, mode.type === 'forecast')
  }

  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.1 })
    }
  }

  const handleGenerateDeepLayer = async () => {
    if (currentMaxOrder >= maxAllowedOrder || isGeneratingDeepLayer) return

    setIsGeneratingDeepLayer(true)

    try {
      // Get all nodes of the current highest order as parents
      const parentNodes = nodes.filter(n => n.data.order === currentMaxOrder)
      const targetOrder = currentMaxOrder + 1

      // Call API to generate next layer
      const response = await fetch('/api/generate-layer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentNodes,
          targetOrder
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate deep layer')
      }

      const layerData = await response.json()

      // Create new nodes and edges
      const newNodes: DecisionNode[] = []
      const newEdges: DecisionEdge[] = []

      layerData.consequences.forEach((consequence: any, index: number) => {
        const nodeId = `layer-${targetOrder}-${index}`
        const parentNode = parentNodes.find(p => p.id === consequence.parentId) || parentNodes[index % parentNodes.length]

        const newNode: DecisionNode = {
          id: nodeId,
          type: 'interactive',
          data: {
            label: consequence.title,
            description: consequence.description,
            order: targetOrder,
            nodeType: mode.type === 'decision' ? 'consequence' : 'forecast'
          },
          position: { x: 0, y: 0 } // Will be set by layout
        }

        const newEdge: DecisionEdge = {
          id: `edge-${parentNode.id}-${nodeId}`,
          source: parentNode.id,
          target: nodeId,
          type: 'smoothstep',
          animated: true
        }

        newNodes.push(newNode)
        newEdges.push(newEdge)
      })

      // Update nodes and edges with layout
      const allNodes = [...nodes, ...newNodes]
      const allEdges = [...edges, ...newEdges]

      recalculateLayout(allNodes, setNodes, mode.type === 'forecast')
      setEdges(allEdges)

      // Auto-fit the view after adding new layer
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 600 })
        }
      }, 300)

      // Generate commentary for the new layer
      const currentAnalysis: DecisionAnalysis = {
        nodes: allNodes,
        edges: allEdges,
        commentary,
        mode
      }

      const layerCommentary = await generateCommentary(currentAnalysis, 'nodeAdd', newNodes.map(n => n.id))
      setCommentary(prev => [...prev, layerCommentary])

    } catch (error) {
      console.error('Error generating deep layer:', error)
      const errorCommentary: Commentary = {
        id: `error-${Date.now()}`,
        content: 'An error occurred while generating the additional layer. Please try again.',
        timestamp: new Date(),
        triggeredBy: 'nodeAdd',
        relatedNodes: []
      }
      setCommentary(prev => [...prev, errorCommentary])
    } finally {
      setIsGeneratingDeepLayer(false)
    }
  }

  const handleDataSourcesUpdated = (slackConnected: boolean, gdriveConnected: boolean) => {
    setHasSlackData(slackConnected)
    setHasGDriveData(gdriveConnected)
  }

  const handleRerunAnalysis = async () => {
    if (!mode.rootInput || isGenerating) return

    // Rerun the analysis with the same input but generate fresh results
    await handleInputSubmit(mode.rootInput)
  }

  const handleDevilsAdvocate = async () => {
    if (!mode.rootInput) return

    // Open modal with loading state
    setDevilsAdvocateModal({
      isOpen: true,
      data: null,
      loading: true
    })

    try {
      // Get contextual data if MCP sources are connected
      let contextualData = null
      if (hasSlackData || hasGDriveData) {
        try {
          const contextResponse = await fetch('/api/mcp/get-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: mode.rootInput,
              sources: [
                ...(hasSlackData ? ['slack'] : []),
                ...(hasGDriveData ? ['gdrive'] : [])
              ]
            })
          })
          if (contextResponse.ok) {
            const contextResult = await contextResponse.json()
            contextualData = contextResult.context
          }
        } catch (error) {
          console.log('Context retrieval failed for devil\'s advocate:', error)
        }
      }

      // Generate devil's advocate analysis
      const response = await fetch('/api/devils-advocate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: mode.type,
          input: mode.rootInput,
          contextualData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate devil\'s advocate analysis')
      }

      const devilsAdvocateData = await response.json()

      setDevilsAdvocateModal({
        isOpen: true,
        data: devilsAdvocateData,
        loading: false
      })

    } catch (error) {
      console.error('Error generating devil\'s advocate analysis:', error)
      setDevilsAdvocateModal({
        isOpen: true,
        data: {
          title: 'Analysis Error',
          summary: 'Unable to generate contrarian analysis at this time.',
          arguments: [],
          conclusion: 'Please try again later.'
        },
        loading: false
      })
    }
  }

  const handleCloseDevilsAdvocate = () => {
    setDevilsAdvocateModal({
      isOpen: false,
      data: null,
      loading: false
    })
  }

  const handleScenarioAnalysis = async () => {
    if (!mode.rootInput) return

    // Open modal with loading state
    setScenarioModal({
      isOpen: true,
      data: null,
      loading: true
    })

    try {
      // Get contextual data if MCP sources are connected
      let contextualData = null
      if (hasSlackData || hasGDriveData) {
        try {
          const contextResponse = await fetch('/api/mcp/get-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: mode.rootInput,
              sources: [
                ...(hasSlackData ? ['slack'] : []),
                ...(hasGDriveData ? ['gdrive'] : [])
              ]
            })
          })
          if (contextResponse.ok) {
            const contextResult = await contextResponse.json()
            contextualData = contextResult.context
          }
        } catch (error) {
          console.log('Context retrieval failed for scenario analysis:', error)
        }
      }

      // Generate scenario analysis
      const response = await fetch('/api/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: mode.rootInput,
          contextualData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate scenario analysis')
      }

      const scenarioData = await response.json()

      setScenarioModal({
        isOpen: true,
        data: scenarioData,
        loading: false
      })

    } catch (error) {
      console.error('Error generating scenario analysis:', error)
      setScenarioModal({
        isOpen: true,
        data: {
          targetOutcome: mode.rootInput,
          tracks: [],
          methodology: 'Error occurred during analysis',
          keyUncertainties: ['Analysis generation failed']
        },
        loading: false
      })
    }
  }

  const handleCloseScenario = () => {
    setScenarioModal({
      isOpen: false,
      data: null,
      loading: false
    })
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

      // For scenario mode, we don't generate node trees - scenarios are handled separately
      if (mode.type === 'scenario') {
        setIsGenerating(false)
        return // Scenario analysis uses the modal system, not node trees
      }

      // Generate consequences or causal pathways based on mode
      let analysis: DecisionAnalysis
      if (mode.type === 'decision') {
        analysis = await generateConsequences(input, hasSlackData, hasGDriveData)
      } else {
        analysis = await generateCausalPathways(input, hasSlackData, hasGDriveData)
      }

      // Update nodes and edges with generated analysis
      setNodes(analysis.nodes)
      setEdges(analysis.edges)

      // Auto-fit the view after analysis is complete
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 })
        }
      }, 500)

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
    recalculateLayout(updatedNodes, setNodes, mode.type === 'forecast')

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
    recalculateLayout(updatedNodes, setNodes, mode.type === 'forecast')
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
    recalculateLayout(updatedNodes, setNodes, mode.type === 'forecast')
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
            <div className="flex items-center gap-3">
              <McpIntegrationPanel onDataSourcesUpdated={handleDataSourcesUpdated} />
              <DarkModeToggle />
            </div>
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
              <>
                <RerunAnalysisButton
                  onRerun={handleRerunAnalysis}
                  isGenerating={isGenerating}
                  hasAnalysis={nodes.length > 0}
                  analysisType={mode.type}
                  disabled={isGeneratingDeepLayer || devilsAdvocateModal.loading}
                />
                <DevilsAdvocateButton
                  onOpenDevilsAdvocate={handleDevilsAdvocate}
                  isGenerating={devilsAdvocateModal.loading}
                  hasAnalysis={nodes.length > 0}
                  analysisType={mode.type}
                  disabled={isGenerating || isGeneratingDeepLayer}
                />
                <LayoutControls
                  onAutoLayout={handleAutoLayout}
                  onFitView={handleFitView}
                  isGenerating={isGenerating || isGeneratingDeepLayer || devilsAdvocateModal.loading}
                />
                <DeepLayerButton
                  onGenerateDeepLayer={handleGenerateDeepLayer}
                  isGenerating={isGeneratingDeepLayer}
                  currentMaxOrder={currentMaxOrder}
                  maxAllowedOrder={maxAllowedOrder}
                  disabled={isGenerating || devilsAdvocateModal.loading || scenarioModal.loading}
                />
                <ScenarioButton
                  onOpenScenario={handleScenarioAnalysis}
                  isGenerating={scenarioModal.loading}
                  hasAnalysis={mode.rootInput.length > 0}
                  disabled={isGenerating || isGeneratingDeepLayer || devilsAdvocateModal.loading}
                />
              </>
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

      {/* Devil's Advocate Modal */}
      <DevilsAdvocateModal
        isOpen={devilsAdvocateModal.isOpen}
        onClose={handleCloseDevilsAdvocate}
        data={devilsAdvocateModal.data}
        analysisType={mode.type}
        loading={devilsAdvocateModal.loading}
      />

      {/* Scenario Analysis Modal */}
      <ScenarioAnalysisModal
        isOpen={scenarioModal.isOpen}
        onClose={handleCloseScenario}
        data={scenarioModal.data}
        loading={scenarioModal.loading}
      />
    </div>
  )
}