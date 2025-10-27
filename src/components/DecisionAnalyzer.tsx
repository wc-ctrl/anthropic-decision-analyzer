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
import { ScenarioDisplayPanel } from './ScenarioDisplayPanel'
import { ShareAnalysisButton } from './ShareAnalysisButton'
import { TopicSuggestionButton } from './TopicSuggestionButton'
import { TopicSuggestionModal } from './TopicSuggestionModal'
import { ModeComplexityToggle } from './ModeComplexityToggle'
import { useAutoLayout } from '@/hooks/useAutoLayout'
import { useScreenshot } from '@/hooks/useScreenshot'
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
  const [isSharing, setIsSharing] = useState(false)
  const [isExpertMode, setIsExpertMode] = useState(true)
  const [devilsAdvocateModal, setDevilsAdvocateModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const [scenarioData, setScenarioData] = useState<{
    data: any | null
    loading: boolean
  }>({
    data: null,
    loading: false
  })
  const [topicSuggestionModal, setTopicSuggestionModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const { recalculateLayout } = useAutoLayout()
  const { captureReactFlow, captureScenarioPanel } = useScreenshot()

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
    setScenarioData({ data: null, loading: false })
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

    // Set loading state
    setScenarioData({
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

      const scenarioAnalysis = await response.json()

      setScenarioData({
        data: scenarioAnalysis,
        loading: false
      })

      // Generate commentary for scenario analysis
      const scenarioCommentary = await generateCommentary({
        nodes: [],
        edges: [],
        commentary: [],
        mode: { type: 'scenario', rootInput: mode.rootInput }
      }, 'initialAnalysis', [])
      setCommentary([scenarioCommentary])

    } catch (error) {
      console.error('Error generating scenario analysis:', error)
      setScenarioData({
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

  const handleShareAnalysis = async () => {
    if (!hasSlackData) {
      alert('Please connect to Slack first using the "Connect Slack" button')
      return
    }

    setIsSharing(true)

    try {
      // Capture screenshot based on analysis mode
      let snapshot = null
      if (mode.type === 'scenario') {
        snapshot = await captureScenarioPanel()
      } else if (nodes.length > 0) {
        snapshot = await captureReactFlow()
      }

      // Prepare data for sharing
      const shareData = {
        analysisType: mode.type,
        analysis: mode.type !== 'scenario' ? {
          mode,
          nodes,
          edges,
          commentary
        } : undefined,
        scenarioData: mode.type === 'scenario' ? scenarioData.data : undefined,
        commentary,
        snapshot
      }

      // Share to Slack
      const response = await fetch('/api/share-slack', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData)
      })

      if (!response.ok) {
        throw new Error('Failed to share to Slack')
      }

      const result = await response.json()

      // Add success commentary
      const shareCommentary: Commentary = {
        id: `share-${Date.now()}`,
        content: `**BOTTOM LINE UP FRONT (BLUF):** Analysis successfully shared to #mission-lab-chatter Slack channel.

**KEY ACTIONS COMPLETED:**
• Strategic analysis posted with visual snapshot to team channel
• Full commentary and ${mode.type} insights shared with stakeholders
• Team collaboration enabled for collective strategic input

**RECOMMENDED ACTIONS:**
• Monitor team responses and feedback in Slack channel
• Incorporate team insights into final strategic recommendations`,
        timestamp: new Date(),
        triggeredBy: 'initialAnalysis',
        relatedNodes: []
      }
      setCommentary(prev => [...prev, shareCommentary])

    } catch (error) {
      console.error('Error sharing analysis:', error)

      // Add error commentary
      const errorCommentary: Commentary = {
        id: `share-error-${Date.now()}`,
        content: `**BOTTOM LINE UP FRONT (BLUF):** Failed to share analysis to Slack channel.

**ISSUE IDENTIFIED:**
• Slack sharing encountered technical difficulties
• Analysis remains available locally for manual sharing

**RECOMMENDED ACTIONS:**
• Verify Slack connection status and retry
• Consider manual copy-paste of analysis to team channel`,
        timestamp: new Date(),
        triggeredBy: 'initialAnalysis',
        relatedNodes: []
      }
      setCommentary(prev => [...prev, errorCommentary])
    } finally {
      setIsSharing(false)
    }
  }

  const handleTopicSuggestions = async () => {
    // Open modal with loading state
    setTopicSuggestionModal({
      isOpen: true,
      data: null,
      loading: true
    })

    try {
      // Generate topic suggestions
      const response = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          useSlack: hasSlackData,
          useGDrive: hasGDriveData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate topic suggestions')
      }

      const suggestions = await response.json()

      setTopicSuggestionModal({
        isOpen: true,
        data: suggestions,
        loading: false
      })

    } catch (error) {
      console.error('Error generating topic suggestions:', error)
      setTopicSuggestionModal({
        isOpen: true,
        data: null,
        loading: false
      })
    }
  }

  const handleSelectTopic = (type: 'decision' | 'forecast' | 'scenario', text: string) => {
    // Switch to the appropriate mode and set the input
    setMode({ type, rootInput: text })
    setNodes([])
    setEdges([])
    setCommentary([])
    setScenarioData({ data: null, loading: false })

    // Close the suggestion modal
    setTopicSuggestionModal({
      isOpen: false,
      data: null,
      loading: false
    })
  }

  const handleCloseTopicSuggestions = () => {
    setTopicSuggestionModal({
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
        analysis = await generateConsequences(input, hasSlackData, hasGDriveData, isExpertMode)
      } else {
        analysis = await generateCausalPathways(input, hasSlackData, hasGDriveData, isExpertMode)
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
              <TopicSuggestionButton
                onOpenSuggestions={handleTopicSuggestions}
                isGenerating={topicSuggestionModal.loading}
                slackConnected={hasSlackData}
                disabled={isGenerating || isGeneratingDeepLayer || isSharing}
              />
              <McpIntegrationPanel onDataSourcesUpdated={handleDataSourcesUpdated} />
              <DarkModeToggle />
            </div>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <ModeSelector
              currentMode={mode.type}
              onModeChange={handleModeChange}
            />
            <ModeComplexityToggle
              isExpert={isExpertMode}
              onToggle={setIsExpertMode}
              disabled={isGenerating || isGeneratingDeepLayer || isSharing}
            />
            <InputPanel
              mode={mode.type}
              onSubmit={handleInputSubmit}
              isGenerating={isGenerating}
            />
            {mode.type === 'scenario' && mode.rootInput ? (
              <ScenarioButton
                onOpenScenario={handleScenarioAnalysis}
                isGenerating={scenarioData.loading}
                hasAnalysis={mode.rootInput.length > 0}
                disabled={false}
              />
            ) : (nodes.length > 0 || (mode.type === 'scenario' && scenarioData.data)) ? (
              <>
                <RerunAnalysisButton
                  onRerun={handleRerunAnalysis}
                  isGenerating={isGenerating}
                  hasAnalysis={nodes.length > 0}
                  analysisType={mode.type}
                  disabled={isGeneratingDeepLayer || devilsAdvocateModal.loading || isSharing}
                />
                <DevilsAdvocateButton
                  onOpenDevilsAdvocate={handleDevilsAdvocate}
                  isGenerating={devilsAdvocateModal.loading}
                  hasAnalysis={nodes.length > 0}
                  analysisType={mode.type}
                  disabled={isGenerating || isGeneratingDeepLayer || isSharing}
                />
                <ShareAnalysisButton
                  onShare={handleShareAnalysis}
                  isSharing={isSharing}
                  hasAnalysis={nodes.length > 0 || (mode.type === 'scenario' && !!scenarioData.data)}
                  analysisType={mode.type}
                  slackConnected={hasSlackData}
                  disabled={isGenerating || isGeneratingDeepLayer || devilsAdvocateModal.loading}
                />
                <LayoutControls
                  onAutoLayout={handleAutoLayout}
                  onFitView={handleFitView}
                  isGenerating={isGenerating || isGeneratingDeepLayer || devilsAdvocateModal.loading || isSharing}
                />
                {isExpertMode && (
                  <DeepLayerButton
                    onGenerateDeepLayer={handleGenerateDeepLayer}
                    isGenerating={isGeneratingDeepLayer}
                    currentMaxOrder={currentMaxOrder}
                    maxAllowedOrder={maxAllowedOrder}
                    disabled={isGenerating || devilsAdvocateModal.loading || scenarioData.loading || isSharing}
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-120px)]">
        {/* Graph Area / Scenario Display */}
        <div className="flex-1">
          {mode.type === 'scenario' ? (
            <ScenarioDisplayPanel
              data={scenarioData.data}
              loading={scenarioData.loading}
            />
          ) : (
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
          )}
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

      {/* Topic Suggestion Modal */}
      <TopicSuggestionModal
        isOpen={topicSuggestionModal.isOpen}
        onClose={handleCloseTopicSuggestions}
        data={topicSuggestionModal.data}
        loading={topicSuggestionModal.loading}
        onSelectTopic={handleSelectTopic}
      />

    </div>
  )
}