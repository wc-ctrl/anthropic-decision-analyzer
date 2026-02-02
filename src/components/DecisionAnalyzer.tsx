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
import { DocumentUploadPanel } from './DocumentUploadPanel'
import { SlackContextSuggestions, SlackSuggestion } from './SlackContextSuggestions'
import { RerunAnalysisButton } from './RerunAnalysisButton'
import { DevilsAdvocateButton } from './DevilsAdvocateButton'
import { DevilsAdvocateModal } from './DevilsAdvocateModal'
import { SteelmanButton } from './SteelmanButton'
import { SteelmanModal } from './SteelmanModal'
import { WargamingButton } from './WargamingButton'
import { WargamingModal } from './WargamingModal'
import { ScenarioButton } from './ScenarioButton'
import { ScenarioDisplayPanel } from './ScenarioDisplayPanel'
import { ShareAnalysisButton } from './ShareAnalysisButton'
import { TopicSuggestionButton } from './TopicSuggestionButton'
import { TopicSuggestionModal } from './TopicSuggestionModal'
import { ModeComplexityToggle } from './ModeComplexityToggle'
import { ExpertSettings } from './ExpertSettings'
import { GetWeirdButton } from './GetWeirdButton'
import { WeirdAnalysisModal } from './WeirdAnalysisModal'
import { DrillDownModal } from './DrillDownModal'
import { StrategyDisplayPanel } from './StrategyDisplayPanel'
import { FrameworkPicker } from './FrameworkPicker'
import { FrameworkDisplayPanel } from './FrameworkDisplayPanel'
import { FrameworkDefinition, PopulatedFramework } from '@/types/framework'
import { DataSourceBrowser } from './DataSourceBrowser'
import { OnboardingModal } from './OnboardingModal'
import { GoalClarifierButton } from './GoalClarifierButton'
import { GoalClarifierModal } from './GoalClarifierModal'
import { SimulationButton } from './simulation/SimulationButton'
import { SimulationModal } from './simulation/SimulationModal'
import { AnalysisToolbar } from './AnalysisToolbar'
import { WebSourcesPanel } from './WebSourcesPanel'
import { useAutoLayout } from '@/hooks/useAutoLayout'
import { useOnboarding } from '@/hooks/useOnboarding'
import { useScreenshot } from '@/hooks/useScreenshot'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useGoalClarifier } from '@/hooks/useGoalClarifier'
import { useSimulation } from '@/hooks/useSimulation'
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
  const [hasDocuments, setHasDocuments] = useState(false)
  const [uploadPanelOpen, setUploadPanelOpen] = useState(false)
  const [slackEnabled, setSlackEnabled] = useState(false)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [slackSuggestions, setSlackSuggestions] = useState<SlackSuggestion[]>([])
  const [loadingSlackSuggestions, setLoadingSlackSuggestions] = useState(false)
  const [pendingAnalysisInput, setPendingAnalysisInput] = useState<string | null>(null)
  const [selectedSlackContext, setSelectedSlackContext] = useState<SlackSuggestion[]>([])
  const [isSharing, setIsSharing] = useState(false)
  const [isExpertMode, setIsExpertMode] = useState(true)
  const [expertSettings, setExpertSettings] = useState({
    firstOrderCount: 5,
    secondOrderCount: 2
  })
  const [devilsAdvocateModal, setDevilsAdvocateModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const [steelmanModal, setSteelmanModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const [wargamingModal, setWargamingModal] = useState({
    isOpen: false,
    actors: [] as any[],
    loading: false
  })
  const [scenarioData, setScenarioData] = useState<{
    data: any | null
    loading: boolean
  }>({
    data: null,
    loading: false
  })
  const [strategyData, setStrategyData] = useState<{
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
  const [drillDownModal, setDrillDownModal] = useState({
    isOpen: false,
    focusNode: null as DecisionNode | null
  })
  const [weirdAnalysisModal, setWeirdAnalysisModal] = useState({
    isOpen: false,
    data: null as any,
    loading: false
  })
  const [dataSourceBrowserOpen, setDataSourceBrowserOpen] = useState(false)
  const [onboardingMode, setOnboardingMode] = useState<'decision' | 'forecast' | 'scenario' | 'strategy' | 'framework' | null>(null)
  const [selectedFramework, setSelectedFramework] = useState<FrameworkDefinition | null>(null)
  const [frameworkData, setFrameworkData] = useState<{
    data: PopulatedFramework | null
    loading: boolean
  }>({
    data: null,
    loading: false
  })
  const [webSearchResults, setWebSearchResults] = useState<{
    searchResults: Array<{ title: string; url: string; snippet: string; source: string }>
    queryCount?: number
    lastUpdated?: string
  }>({ searchResults: [] })
  const { recalculateLayout } = useAutoLayout()
  const { captureReactFlow, captureScenarioPanel } = useScreenshot()
  const { logQuery, logFeatureUse, logModeSwitch, logFrameworkSelect, logExport, logShare } = useAnalytics()
  const { shouldShowOnboarding, markModeSeen, skipAllOnboarding, isInitialized } = useOnboarding()

  // Goal Clarifier
  const goalClarifier = useGoalClarifier()
  const [goalClarifierOpen, setGoalClarifierOpen] = useState(false)

  // Simulation
  const simulation = useSimulation()
  const [simulationOpen, setSimulationOpen] = useState(false)

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

    const handleNodeDrillDown = (event: CustomEvent) => {
      // Allow drill-down (deep dive) in all modes
      const { nodeId, nodeData } = event.detail
      const focusNode = nodes.find(n => n.id === nodeId)
      if (focusNode && focusNode.data.order > 0) { // Don't drill down on root
        setDrillDownModal({
          isOpen: true,
          focusNode
        })
      }
    }

    window.addEventListener('nodeEdit', handleNodeEdit as EventListener)
    window.addEventListener('nodeAdd', handleNodeAdd as EventListener)
    window.addEventListener('nodeDelete', handleNodeDelete as EventListener)
    window.addEventListener('nodeDrillDown', handleNodeDrillDown as EventListener)

    return () => {
      window.removeEventListener('nodeEdit', handleNodeEdit as EventListener)
      window.removeEventListener('nodeAdd', handleNodeAdd as EventListener)
      window.removeEventListener('nodeDelete', handleNodeDelete as EventListener)
      window.removeEventListener('nodeDrillDown', handleNodeDrillDown as EventListener)
    }
  }, [nodes, edges, commentary, mode])

  const onConnect = useCallback((params: Connection) => {
    const edge = { ...params, type: 'smoothstep' as const, animated: true }
    setEdges((eds) => addEdge(edge, eds) as DecisionEdge[])
  }, [setEdges])

  const handleModeChange = (newMode: 'decision' | 'forecast' | 'scenario' | 'strategy' | 'framework') => {
    logModeSwitch(mode.type, newMode)
    setMode({ type: newMode, rootInput: '' })
    setNodes([])
    setEdges([])
    setCommentary([])
    setScenarioData({ data: null, loading: false })
    setStrategyData({ data: null, loading: false })
    setSelectedFramework(null)
    setFrameworkData({ data: null, loading: false })
    setWebSearchResults({ searchResults: [] })

    // Show onboarding if first time seeing this mode in session
    if (newMode !== 'framework' && shouldShowOnboarding(newMode)) {
      setOnboardingMode(newMode)
    }
  }

  const handleFrameworkSelect = (framework: FrameworkDefinition) => {
    logFrameworkSelect(framework.id, framework.name)
    setSelectedFramework(framework)
  }

  const generateFrameworkAnalysis = async (input: string, framework: FrameworkDefinition) => {
    setFrameworkData({ data: null, loading: true })

    try {
      // Get web context
      let webContext = null
      try {
        const webResponse = await fetch('/api/web-enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input,
            analysisType: 'framework',
            isNonUSFocused: false
          })
        })
        if (webResponse.ok) {
          webContext = await webResponse.json()
          if (webContext?.searchResults) {
            setWebSearchResults({
              searchResults: webContext.searchResults,
              queryCount: webContext.queryCount,
              lastUpdated: webContext.lastUpdated,
            })
          }
        }
      } catch (error) {
        console.log('Web context failed for framework:', error)
      }

      const response = await fetch('/api/framework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          frameworkId: framework.id,
          frameworkName: framework.name,
          fields: framework.fields.map(f => ({ id: f.id, label: f.label })),
          input,
          webContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to populate framework')
      }

      const result = await response.json()
      setFrameworkData({ data: result, loading: false })

      // Generate commentary
      const frameworkCommentary: Commentary = {
        id: `framework-${Date.now()}`,
        content: `**FRAMEWORK ANALYSIS COMPLETE:** ${framework.name}

**Case:** ${input}

**Dimensions Analyzed:** ${framework.fields.length} fields populated with strategic analysis.

${result.recommendation ? `**Recommendation:** ${result.recommendation.substring(0, 200)}...` : ''}

**Next Steps:**
• Review each dimension for actionable insights
• Cross-reference findings across fields
• Consider applying additional frameworks for triangulation`,
        timestamp: new Date(),
        triggeredBy: 'initialAnalysis',
        relatedNodes: []
      }
      setCommentary([frameworkCommentary])

    } catch (error) {
      console.error('Error generating framework analysis:', error)
      setFrameworkData({ data: null, loading: false })
    }
  }

  const handleCloseOnboarding = () => {
    if (onboardingMode) {
      markModeSeen(onboardingMode)
    }
    setOnboardingMode(null)
  }

  const handleSkipAllOnboarding = () => {
    skipAllOnboarding()
    setOnboardingMode(null)
  }

  // Show onboarding for default mode (decision) once initialized
  React.useEffect(() => {
    if (isInitialized && shouldShowOnboarding('decision')) {
      setOnboardingMode('decision')
    }
  }, [isInitialized, shouldShowOnboarding])

  // Helper function to get all root inputs (supports multi-root scenarios)
  const getAllRootInputs = (): string => {
    const rootNodes = nodes.filter(node => node.data.order === 0)
    return rootNodes.length > 0
      ? rootNodes.map(node => node.data.label).join('; ')
      : mode.rootInput
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

  const handleDataSourcesUpdated = useCallback((documentsAvailable: boolean) => {
    setHasDocuments(documentsAvailable)
  }, [])

  const handleImportContent = (content: string, source: string) => {
    // Add the imported content as a commentary entry with visual distinction
    const newCommentary: Commentary = {
      type: 'analysis',
      content: `**📎 Context Added: ${source}**\n\n${content.substring(0, 800)}${content.length > 800 ? '...\n\n_(Full content will be used in analysis)_' : ''}`,
      timestamp: new Date().toISOString(),
      context: {
        source: source,
        fullContent: content,
        isContextItem: true
      }
    }
    setCommentary(prev => [newCommentary, ...prev])
  }

  const handleExportPowerPoint = async () => {
    if (nodes.length === 0) return
    logExport('powerpoint')

    try {
      const rootInputs = getAllRootInputs()
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/export/powerpoint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes,
          edges: edges,
          title: rootInputs || 'Decision Analysis',
          mode: mode.type
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${rootInputs.replace(/[^a-z0-9]/gi, '_') || 'analysis'}_decision_tree.pptx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('PowerPoint export failed:', error)
      alert('Failed to export PowerPoint. Please try again.')
    }
  }

  const handleExportWord = async () => {
    if (nodes.length === 0) return
    logExport('word')

    try {
      // Gather analysis summary from commentary
      const analysisSummary = commentary
        .filter(c => c.type === 'analysis')
        .map(c => c.content)
        .join('\n\n')

      const rootInputs = getAllRootInputs()
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/export/word`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: nodes,
          edges: edges,
          title: rootInputs || 'Decision Analysis',
          mode: mode.type,
          analysis: analysisSummary
        })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${rootInputs.replace(/[^a-z0-9]/gi, '_') || 'analysis'}_analysis.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Word export failed:', error)
      alert('Failed to export Word document. Please try again.')
    }
  }

  const handleRerunAnalysis = async () => {
    if (!mode.rootInput || isGenerating) return

    // Rerun the analysis with the same input but generate fresh results
    await handleInputSubmit(mode.rootInput)
  }

  const handleDevilsAdvocate = async () => {
    if (!mode.rootInput) return

    // Log feature usage
    logFeatureUse('devils-advocate')

    // Open modal with loading state
    setDevilsAdvocateModal({
      isOpen: true,
      data: null,
      loading: true
    })

    try {
      // Get contextual data if MCP sources are connected
      let contextualData = null
      if (hasDocuments) {
        try {
          const contextResponse = await fetch('/api/mcp/get-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: mode.rootInput,
              sources: hasDocuments ? ['documents'] : []
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

      // Get web context
      let webContext = null
      try {
        const webResponse = await fetch('/api/web-enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: mode.rootInput,
            analysisType: mode.type,
            isNonUSFocused: false
          })
        })
        if (webResponse.ok) {
          webContext = await webResponse.json()
          if (webContext?.searchResults) {
            setWebSearchResults({
              searchResults: webContext.searchResults,
              queryCount: webContext.queryCount,
              lastUpdated: webContext.lastUpdated,
            })
          }
        }
      } catch (error) {
        console.log('Web context failed for devil\'s advocate:', error)
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
          contextualData,
          webContext
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

  const handleSteelman = async () => {
    if (!mode.rootInput) return

    // Log feature usage
    logFeatureUse('steelman')

    // Open modal with loading state
    setSteelmanModal({
      isOpen: true,
      data: null,
      loading: true
    })

    try {
      // Get contextual data if MCP sources are connected
      let contextualData = null
      if (hasDocuments) {
        try {
          const contextResponse = await fetch('/api/mcp/get-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: mode.rootInput,
              sources: hasDocuments ? ['documents'] : []
            })
          })
          if (contextResponse.ok) {
            const contextResult = await contextResponse.json()
            contextualData = contextResult.context
          }
        } catch (error) {
          console.log('Context retrieval failed, proceeding without MCP data:', error)
        }
      }

      // Get web context
      let webContext = null
      try {
        const webResponse = await fetch('/api/web-enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: mode.rootInput,
            analysisType: mode.type,
            isNonUSFocused: false
          })
        })
        if (webResponse.ok) {
          webContext = await webResponse.json()
          if (webContext?.searchResults) {
            setWebSearchResults({
              searchResults: webContext.searchResults,
              queryCount: webContext.queryCount,
              lastUpdated: webContext.lastUpdated,
            })
          }
        }
      } catch (error) {
        console.log('Web context failed for steelman:', error)
      }

      // Call steelman API endpoint
      const response = await fetch('/api/steelman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: mode.type,
          input: mode.rootInput,
          contextualData,
          webContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate steelman analysis')
      }

      const steelmanData = await response.json()

      setSteelmanModal({
        isOpen: true,
        data: steelmanData,
        loading: false
      })

    } catch (error) {
      console.error('Error generating steelman analysis:', error)
      setSteelmanModal({
        isOpen: true,
        data: {
          title: 'Analysis Error',
          summary: 'Unable to generate steelman analysis at this time.',
          arguments: [],
          conclusion: 'Please try again later.'
        },
        loading: false
      })
    }
  }

  const handleCloseSteelman = () => {
    setSteelmanModal({
      isOpen: false,
      data: null,
      loading: false
    })
  }

  const handleWargaming = async () => {
    if (!mode.rootInput && nodes.length === 0) return

    // Log feature usage
    logFeatureUse('wargaming')

    // Open modal with loading state
    setWargamingModal({
      isOpen: true,
      actors: [],
      loading: true
    })

    try {
      // Get all root inputs for multi-root support
      const rootInputs = getAllRootInputs()

      // Extract actors from the current analysis
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      if (!backendUrl) throw new Error('Backend URL not configured')
      const response = await fetch(`${backendUrl}/api/wargaming/extract-actors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: rootInputs,
          nodes: nodes,
          analysisType: mode.type
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Actor extraction failed: HTTP ${response.status} - ${errorText}`)
        throw new Error(`Failed to extract actors: HTTP ${response.status}`)
      }

      const data = await response.json()

      setWargamingModal({
        isOpen: true,
        actors: data.actors || [],
        loading: false
      })

    } catch (error) {
      console.error('Error extracting actors for wargaming:', error)
      setWargamingModal({
        isOpen: true,
        actors: [],
        loading: false
      })
    }
  }

  const handleCloseWargaming = () => {
    setWargamingModal({
      isOpen: false,
      actors: [],
      loading: false
    })
  }

  const handleScenarioAnalysis = async () => {
    if (!mode.rootInput) return

    logFeatureUse('scenario-analysis')

    // Set loading state
    setScenarioData({
      data: null,
      loading: true
    })

    try {
      // Get contextual data if MCP sources are connected
      let contextualData = null
      if (hasDocuments) {
        try {
          const contextResponse = await fetch('/api/mcp/get-context', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: mode.rootInput,
              sources: hasDocuments ? ['documents'] : []
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

      // Get web context
      let webContext = null
      try {
        const webResponse = await fetch('/api/web-enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: mode.rootInput,
            analysisType: 'scenario',
            isNonUSFocused: false
          })
        })
        if (webResponse.ok) {
          webContext = await webResponse.json()
          if (webContext?.searchResults) {
            setWebSearchResults({
              searchResults: webContext.searchResults,
              queryCount: webContext.queryCount,
              lastUpdated: webContext.lastUpdated,
            })
          }
        }
      } catch (error) {
        console.log('Web context failed for scenario analysis:', error)
      }

      // Generate scenario analysis
      const response = await fetch('/api/scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: mode.rootInput,
          contextualData,
          webContext
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
    logShare('slack')
    // Share works with or without documents
    setIsSharing(true)

    try {
      // Generate quick assessment for sharing
      const assessmentResponse = await fetch('/api/quick-assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nodes,
          analysisType: mode.type,
          decision: mode.rootInput
        })
      })

      let quickAssessment = null
      if (assessmentResponse.ok) {
        quickAssessment = await assessmentResponse.json()
      }

      // Prepare data for sharing (quick assessment + commentary)
      const shareData = {
        analysisType: mode.type,
        rootInput: mode.rootInput,
        quickAssessment,
        commentary
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
        content: `**BOTTOM LINE UP FRONT (BLUF):** Quick assessment successfully shared to #temp-p-claudeswitz Slack channel.

**KEY ACTIONS COMPLETED:**
• Executive verdict and net benefit analysis posted to team channel
• Strategic commentary included for stakeholder review
• Team collaboration enabled for collective strategic input

**RECOMMENDED ACTIONS:**
• Monitor team responses and feedback in #temp-p-claudeswitz
• Incorporate team insights into final strategic recommendations`,
        timestamp: new Date(),
        triggeredBy: 'initialAnalysis',
        relatedNodes: []
      }
      setCommentary(prev => [...prev, shareCommentary])

    } catch (error) {
      console.error('Error sharing quick assessment:', error)

      // Add error commentary
      const errorCommentary: Commentary = {
        id: `share-error-${Date.now()}`,
        content: `**BOTTOM LINE UP FRONT (BLUF):** Failed to share quick assessment to Slack channel.

**ISSUE IDENTIFIED:**
• Slack sharing encountered technical difficulties
• Quick assessment remains available locally for manual sharing

**RECOMMENDED ACTIONS:**
• Verify Slack connection status and retry
• Consider manual copy-paste of assessment to #temp-p-claudeswitz`,
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
          useDocuments: hasDocuments
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

  const handleSelectTopic = async (type: 'decision' | 'forecast' | 'scenario', text: string) => {
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

    // Automatically start analysis for the selected topic
    setTimeout(() => {
      handleInputSubmit(text)
    }, 100) // Small delay to ensure state updates complete
  }

  const handleCloseTopicSuggestions = () => {
    setTopicSuggestionModal({
      isOpen: false,
      data: null,
      loading: false
    })
  }

  const handleDrillDownSave = async (insights: any) => {
    // Apply drill-down insights to main tree
    try {
      if (insights.propagationSuggestions && insights.propagationSuggestions.length > 0) {
        let updatedNodes = [...nodes]

        insights.propagationSuggestions.forEach((suggestion: any) => {
          updatedNodes = updatedNodes.map(node =>
            node.id === suggestion.targetNodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    description: `${node.data.description || ''}\n\nDrill-down insight: ${suggestion.suggestedUpdate}`.trim()
                  }
                }
              : node
          )
        })

        setNodes(updatedNodes)

        // Add propagation commentary
        const propagationCommentary: Commentary = {
          id: `drill-down-${Date.now()}`,
          content: `**BOTTOM LINE UP FRONT (BLUF):** Deep dive analysis completed and insights propagated to main tree.

**KEY FINDINGS FROM DRILL-DOWN:**
${insights.keyFindings ? insights.keyFindings.map((finding: string) => `• ${finding}`).join('\n') : '• Detailed analysis completed'}

**STRATEGIC IMPLICATIONS:**
• ${insights.strategicImplications || 'Analysis enhanced with focused insights'}

**RECOMMENDED ACTIONS:**
• Review updated node descriptions with drill-down insights
• Consider implications for related strategic decisions`,
          timestamp: new Date(),
          triggeredBy: 'nodeEdit',
          relatedNodes: [insights.focusNodeId]
        }

        setCommentary(prev => [...prev, propagationCommentary])
      }

      setDrillDownModal({
        isOpen: false,
        focusNode: null
      })

    } catch (error) {
      console.error('Error applying drill-down insights:', error)
    }
  }

  const handleCloseDrillDown = () => {
    setDrillDownModal({
      isOpen: false,
      focusNode: null
    })
  }

  const handleGetWeird = async () => {
    if (!mode.rootInput || nodes.length <= 1) return

    setWeirdAnalysisModal({
      isOpen: true,
      data: null,
      loading: true
    })

    try {
      // Get web context for enhanced weird analysis
      let webContext = null
      try {
        const webResponse = await fetch('/api/web-enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: mode.rootInput,
            analysisType: mode.type,
            isNonUSFocused: false
          })
        })
        if (webResponse.ok) {
          webContext = await webResponse.json()
          if (webContext?.searchResults) {
            setWebSearchResults({
              searchResults: webContext.searchResults,
              queryCount: webContext.queryCount,
              lastUpdated: webContext.lastUpdated,
            })
          }
        }
      } catch (error) {
        console.log('Web context failed for weird analysis:', error)
      }

      // Generate weird analysis
      const response = await fetch('/api/get-weird', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: mode.rootInput,
          analysisType: mode.type,
          existingNodes: nodes,
          isExpertMode,
          webContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate weird analysis')
      }

      const weirdData = await response.json()

      setWeirdAnalysisModal({
        isOpen: true,
        data: weirdData,
        loading: false
      })

    } catch (error) {
      console.error('Error generating weird analysis:', error)
      setWeirdAnalysisModal({
        isOpen: true,
        data: {
          weirdNodes: [],
          weirdnessRationale: 'Failed to generate unconventional analysis',
          diagnosticValue: 'Try again later',
          probabilityJustification: 'Analysis generation encountered an error'
        },
        loading: false
      })
    }
  }

  const handleAddWeirdNodes = async (weirdNodes: any[]) => {
    // Add weird nodes to the main decision tree
    const newNodes: DecisionNode[] = weirdNodes.map((weird, index) => ({
      id: `weird-${Date.now()}-${index}`,
      type: 'interactive',
      data: {
        ...weird.data,
        isWeird: true
      },
      position: { x: 0, y: 0 }
    }))

    // Create edges connecting weird nodes to appropriate parents
    const newEdges: DecisionEdge[] = []
    const rootNode = nodes.find(n => n.data.order === 0)
    if (rootNode) {
      newNodes.forEach(node => {
        newEdges.push({
          id: `edge-weird-${node.id}`,
          source: rootNode.id,
          target: node.id,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5,5' }
        })
      })
    }

    const updatedNodes = [...nodes, ...newNodes]
    const updatedEdges = [...edges, ...newEdges]

    recalculateLayout(updatedNodes, setNodes, mode.type === 'forecast')
    setEdges(updatedEdges)

    // Add weird analysis commentary
    const weirdCommentary: Commentary = {
      id: `weird-${Date.now()}`,
      content: `**BOTTOM LINE UP FRONT (BLUF):** Unconventional analysis reveals overlooked possibilities with diagnostic value.

**WEIRD INSIGHTS ADDED:**
${weirdNodes.map(w => `• ${w.data.label} (${w.data.probability}% probability)`).join('\n')}

**STRATEGIC VALUE:**
• Cognitive intuition pumps surface blind spots in conventional analysis
• Low-probability scenarios provide early warning diagnostic signals
• Unconventional thinking reveals strategic possibilities others might miss

**RECOMMENDED ACTIONS:**
• Monitor diagnostic signals for early detection of weird scenarios
• Consider mitigation strategies for unconventional negative outcomes
• Explore opportunities in overlooked but plausible scenarios`,
      timestamp: new Date(),
      triggeredBy: 'nodeAdd',
      relatedNodes: newNodes.map(n => n.id)
    }
    setCommentary(prev => [...prev, weirdCommentary])
  }

  const generateStrategyFramework = async (input: string) => {
    setStrategyData({ data: null, loading: true })

    try {
      // Get web context for strategy development
      let webContext = null
      try {
        const webResponse = await fetch('/api/web-enhanced-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input,
            analysisType: 'strategy',
            isNonUSFocused: false
          })
        })
        if (webResponse.ok) {
          webContext = await webResponse.json()
          if (webContext?.searchResults) {
            setWebSearchResults({
              searchResults: webContext.searchResults,
              queryCount: webContext.queryCount,
              lastUpdated: webContext.lastUpdated,
            })
          }
        }
      } catch (error) {
        console.log('Web context failed for strategy:', error)
      }

      // Gather prior analysis if available from previous modes
      const priorAnalysis = {
        decision: nodes.length > 0 ? { summary: `${nodes.length} consequences analyzed` } : null,
        scenario: scenarioData.data ? { summary: 'Scenario analysis available' } : null
      }

      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          priorAnalysis,
          contextualData: hasDocuments ? await getMcpContext(input) : null,
          webContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate strategy framework')
      }

      const strategy = await response.json()

      setStrategyData({ data: strategy, loading: false })

      // Generate strategy commentary
      const strategyCommentary: Commentary = {
        id: `strategy-${Date.now()}`,
        content: `**BOTTOM LINE UP FRONT (BLUF):** Comprehensive strategic framework developed with Ends-Ways-Means analysis.

**STRATEGIC FRAMEWORK GENERATED:**
• Ends: ${strategy.ends?.objectives?.length || 0} strategic objectives with success metrics
• Ways: ${strategy.ways?.approaches?.length || 0} strategic approaches evaluated
• Means: ${strategy.means?.resources?.length || 0} resource requirements analyzed
• Risks: ${strategy.risks?.riskFactors?.length || 0} risk factors with mitigation strategies

**KEY INSIGHTS:**
• Theory of Victory: ${strategy.integration?.theoryOfVictory?.substring(0, 100) || 'Strategic logic established'}...
• Critical Path: ${strategy.integration?.criticalPath?.substring(0, 100) || 'Dependencies identified'}...

**RECOMMENDED ACTIONS:**
• Review measurement criteria for tracking strategic progress
• Monitor critical assumptions and early warning indicators
• Prepare mitigation strategies for identified vulnerabilities`,
        timestamp: new Date(),
        triggeredBy: 'initialAnalysis',
        relatedNodes: []
      }
      setCommentary([strategyCommentary])

    } catch (error) {
      console.error('Error generating strategy:', error)
      setStrategyData({ data: null, loading: false })
    }
  }

  const getMcpContext = async (query: string) => {
    try {
      const response = await fetch('/api/mcp/get-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          sources: hasDocuments ? ['documents'] : []
        })
      })
      if (response.ok) {
        const result = await response.json()
        return result.context
      }
    } catch (error) {
      console.log('MCP context retrieval failed:', error)
    }
    return null
  }

  const handleCloseWeird = () => {
    setWeirdAnalysisModal({
      isOpen: false,
      data: null,
      loading: false
    })
  }

  // Goal Clarifier handlers
  const handleOpenGoalClarifier = () => {
    goalClarifier.reset()
    setGoalClarifierOpen(true)
  }

  const handleCloseGoalClarifier = () => {
    setGoalClarifierOpen(false)
  }

  const handleUseGoal = (refinedGoal: string) => {
    setGoalClarifierOpen(false)
    // Populate the input and trigger analysis
    handleInputSubmit(refinedGoal)
  }

  // Simulation handlers
  const handleOpenSimulation = async () => {
    const context = mode.rootInput || nodes.map(n => n.data.label).join('. ')
    setSimulationOpen(true)
    await simulation.initialize(context)
  }

  const handleCloseSimulation = () => {
    setSimulationOpen(false)
  }

  // Fetch Slack suggestions for a query
  const fetchSlackSuggestions = async (query: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''

      // Use channel-context API if channels are selected, otherwise use suggest-context
      if (selectedChannels.length > 0) {
        const response = await fetch(`${backendUrl}/api/slack/channel-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channels: selectedChannels,
            query: query,  // Filter messages by query keywords
            limit: 10
          })
        })
        if (response.ok) {
          const data = await response.json()
          // Transform channel-context messages to suggestion format
          return (data.messages || []).map((msg: any) => ({
            id: msg.id,
            channel: msg.channel,
            text: msg.text,
            user: msg.user,
            timestamp: msg.timestamp,
            permalink: null
          }))
        }
      } else {
        // Fall back to OAuth-based search (if user has connected)
        const response = await fetch(`${backendUrl}/api/slack/suggest-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query, limit: 5 })
        })
        if (response.ok) {
          const data = await response.json()
          return data.suggestions || []
        }
      }
    } catch (error) {
      console.log('Failed to fetch Slack suggestions:', error)
    }
    return []
  }

  // Run the actual analysis (called after Slack suggestions are confirmed/skipped)
  const runAnalysis = async (input: string, slackContext: SlackSuggestion[] = []) => {
    setIsGenerating(true)
    setMode(prev => ({ ...prev, rootInput: input }))
    setSlackSuggestions([])
    setPendingAnalysisInput(null)

    // Log the query for analytics
    logQuery(input, mode.type)

    try {
      // Check if input contains comma-separated factors
      const inputs = input.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0)
      const isMultiRoot = inputs.length > 1

      // Create initial root node(s)
      if (isMultiRoot) {
        // Create multiple root nodes for multi-factor analysis
        const rootSpacing = 500
        const initialRoots: DecisionNode[] = inputs.map((inputText: string, idx: number) => ({
          id: `root-${idx}`,
          type: 'interactive',
          data: {
            label: inputText,
            order: 0,
            nodeType: mode.type === 'decision' ? 'decision' : 'forecast',
          },
          position: { x: 200 + (idx * rootSpacing), y: 50 }
        }))
        setNodes(initialRoots)
      } else {
        // Create single root node
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
      }

      setEdges([])

      // For scenario, strategy, and framework modes, we don't generate node trees
      if (mode.type === 'scenario') {
        setIsGenerating(false)
        return // Scenario analysis uses the display system, not node trees
      }

      if (mode.type === 'strategy') {
        // Generate strategy framework
        await generateStrategyFramework(input)
        setIsGenerating(false)
        return
      }

      if (mode.type === 'framework' && selectedFramework) {
        await generateFrameworkAnalysis(input, selectedFramework)
        setIsGenerating(false)
        return
      }

      // Generate consequences/pathways
      const analysis = mode.type === 'decision'
        ? await generateConsequences(
            input,
            hasDocuments,
            isExpertMode,
            expertSettings.firstOrderCount,
            expertSettings.secondOrderCount,
            slackContext
          )
        : await generateCausalPathways(
            input,
            hasDocuments,
            isExpertMode,
            expertSettings.firstOrderCount,
            expertSettings.secondOrderCount,
            slackContext
          )

      // Update nodes and edges with generated analysis
      setNodes(analysis.nodes)
      setEdges(analysis.edges)

      // Generate initial commentary with the completed analysis
      try {
        const initialCommentary = await generateCommentary(
          analysis,
          'initialAnalysis',
          analysis.nodes.map(n => n.id)
        )
        setCommentary([initialCommentary])
      } catch {
        // Commentary is non-critical; analysis still works without it
      }

      // Auto-fit the view after analysis is complete
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.2, duration: 800 })
        }
      }, 500)

    } catch (error) {
      console.error('Error generating analysis:', error)
      // Add error commentary
      const errorCommentary: Commentary = {
        id: `commentary-error-${Date.now()}`,
        content: 'An error occurred while generating the analysis. Please try again.',
        timestamp: new Date(),
        triggeredBy: 'nodeEdit',
        relatedNodes: []
      }
      setCommentary([errorCommentary])
    } finally {
      setIsGenerating(false)
      setSelectedSlackContext([])
    }
  }

  const handleInputSubmit = async (input: string) => {
    // If Slack is enabled, fetch suggestions first
    if (slackEnabled) {
      setLoadingSlackSuggestions(true)
      setPendingAnalysisInput(input)
      setMode(prev => ({ ...prev, rootInput: input }))

      const suggestions = await fetchSlackSuggestions(input)
      setLoadingSlackSuggestions(false)

      if (suggestions.length > 0) {
        setSlackSuggestions(suggestions)
        // Don't run analysis yet - wait for user to confirm/skip
        return
      }
    }

    // No Slack or no suggestions - run analysis directly
    await runAnalysis(input, [])
  }

  // Handle when user confirms Slack suggestions
  const handleSlackConfirm = async (selected: SlackSuggestion[]) => {
    if (pendingAnalysisInput) {
      setSelectedSlackContext(selected)
      await runAnalysis(pendingAnalysisInput, selected)
    }
  }

  // Handle when user skips Slack suggestions
  const handleSlackSkip = async () => {
    setSlackSuggestions([])
    if (pendingAnalysisInput) {
      await runAnalysis(pendingAnalysisInput, [])
    }
  }

  const handleNodeEditInternal = async (nodeId: string, newLabel: string, newDescription?: string) => {
    // Update the target node first
    const targetNode = nodes.find(n => n.id === nodeId)
    if (!targetNode) return

    const editedNode = {
      ...targetNode,
      data: {
        ...targetNode.data,
        label: newLabel,
        description: newDescription,
        isEditing: false
      }
    }

    const updatedNodes = nodes.map((node) =>
      node.id === nodeId ? editedNode : node
    )

    // Call intelligent graph update API
    try {
      const updateResponse = await fetch('/api/update-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          targetNode: editedNode,
          allNodes: updatedNodes,
          allEdges: edges,
          analysisType: mode.type,
          isExpertMode
        })
      })

      if (updateResponse.ok) {
        const updateResult = await updateResponse.json()

        // Apply intelligent updates if provided
        if (updateResult.updatedNodes && updateResult.updatedNodes.length > 0) {
          let finalNodes = [...updatedNodes]
          let finalEdges = [...edges]

          updateResult.updatedNodes.forEach((update: any) => {
            if (update.action === 'modify') {
              finalNodes = finalNodes.map(node =>
                node.id === update.id
                  ? { ...node, data: { ...node.data, ...update.data } }
                  : node
              )
            } else if (update.action === 'add') {
              const newNode: DecisionNode = {
                id: update.id,
                type: 'interactive',
                data: update.data,
                position: { x: 0, y: 0 }
              }
              finalNodes.push(newNode)
            }
          })

          if (updateResult.newEdges) {
            updateResult.newEdges.forEach((edge: any) => {
              finalEdges.push({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'smoothstep',
                animated: true
              })
            })
          }

          recalculateLayout(finalNodes, setNodes, mode.type === 'forecast')
          setEdges(finalEdges)

          // Add intelligent update commentary
          const intelligentCommentary = await generateCommentary({
            nodes: finalNodes,
            edges: finalEdges,
            commentary,
            mode
          }, 'nodeEdit', [nodeId])
          setCommentary(prev => [...prev, intelligentCommentary])

          return
        }
      }
    } catch (error) {
      console.error('Intelligent update failed, using basic update:', error)
    }

    // Fallback to basic update
    recalculateLayout(updatedNodes, setNodes, mode.type === 'forecast')

    try {
      const updatedCommentary = await generateCommentary({
        nodes: updatedNodes,
        edges,
        commentary,
        mode
      }, 'nodeEdit', [nodeId])
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
    <div className="h-screen" style={{ background: 'var(--bg-deep)' }}>
      {/* Header */}
      <header className="cw-header px-6 py-4 relative z-50">
        <div className="max-w-[1800px] mx-auto">
          {/* Top Row: Brand + Utilities */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-2xl font-medium tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <svg width="26" height="26" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
                  <g fill="var(--accent-gold, #d4a64a)" stroke="var(--accent-gold, #d4a64a)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M 22 10 C 32.5 11 38.5 18 38 39 L 15 39 C 15 30 25 32.5 23 18" style={{fill: 'var(--accent-gold, #d4a64a)'}} />
                    <path d="M 24 18 C 24.38 20.91 18.45 25.37 16 27 C 13 29 13.18 31.34 11 31 C 9.958 30.06 12.41 27.96 11 28 C 10 28 11.19 29.23 10 30 C 9 30 5.997 31 6 26 C 6 24 12 14 12 14 C 12 14 13.89 12.1 14 10.5 C 13.27 9.506 13.5 8.5 13.5 7.5 C 14.5 6.5 16.5 10 16.5 10 L 18.5 10 C 18.5 10 19.28 8.008 21 7 C 22 7 22 10 22 10" style={{fill: 'var(--accent-gold, #d4a64a)'}} />
                    <circle cx="12" cy="13.5" r="1" fill="var(--bg-primary, #1a1a2e)" />
                    <rect x="10" y="39" width="28" height="3" rx="1" />
                  </g>
                </svg>
                Claudeswitz
              </h1>
              <span className="cw-badge cw-badge-gold">v1.4</span>
            </div>
            <div className="flex items-center gap-3">
              <McpIntegrationPanel
                onDataSourcesUpdated={handleDataSourcesUpdated}
                onUploadClick={() => setUploadPanelOpen(true)}
                slackEnabled={slackEnabled}
                onSlackToggle={setSlackEnabled}
                selectedChannels={selectedChannels}
                onChannelsChange={setSelectedChannels}
              />
              <a
                href="/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="cw-btn cw-btn-ghost text-sm"
                title="View usage analytics"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="M18 17V9"/>
                  <path d="M13 17V5"/>
                  <path d="M8 17v-3"/>
                </svg>
                Analytics
              </a>
              <DarkModeToggle />
            </div>
          </div>

          {/* Mode Controls Row */}
          <div className="flex items-center gap-4">
            {/* Mode Selector */}
            <ModeSelector
              currentMode={mode.type}
              onModeChange={handleModeChange}
            />

            <div className="w-px h-8 bg-[var(--border-subtle)]" />

            {/* Mode Settings */}
            <div className="flex items-center gap-2">
              <ModeComplexityToggle
                isExpert={isExpertMode}
                onToggle={setIsExpertMode}
                disabled={isGenerating || isGeneratingDeepLayer || isSharing}
              />
              {isExpertMode && (
                <ExpertSettings
                  isExpertMode={isExpertMode}
                  firstOrderCount={expertSettings.firstOrderCount}
                  secondOrderCount={expertSettings.secondOrderCount}
                  onSettingsChange={(first, second) => setExpertSettings({ firstOrderCount: first, secondOrderCount: second })}
                  disabled={isGenerating || isGeneratingDeepLayer || isSharing}
                />
              )}
            </div>

            <div className="flex-1" />

            {/* Help Button */}
            <button
              onClick={() => setOnboardingMode(mode.type)}
              className="cw-btn cw-btn-ghost"
              title="Learn how this mode works"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <path d="M12 17h.01"/>
              </svg>
            </button>
          </div>

          {/* Selected Framework Indicator */}
          {mode.type === 'framework' && selectedFramework && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'var(--bg-elevated)', color: 'var(--accent-gold)', fontFamily: 'var(--font-display)' }}
              >
                {selectedFramework.name}
              </span>
              <button
                onClick={() => { setSelectedFramework(null); setFrameworkData({ data: null, loading: false }) }}
                className="text-xs hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Change framework
              </button>
            </div>
          )}

          {/* Input Row - Full Width */}
          <div className={`mt-4 ${mode.type === 'framework' && !selectedFramework ? 'hidden' : ''}`}>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <InputPanel
                  mode={mode.type}
                  onSubmit={handleInputSubmit}
                  isGenerating={isGenerating || loadingSlackSuggestions}
                />
              </div>
              <GoalClarifierButton
                onClick={handleOpenGoalClarifier}
                disabled={isGenerating || isGeneratingDeepLayer}
              />
            </div>

            {/* Slack Context Suggestions */}
            {(loadingSlackSuggestions || slackSuggestions.length > 0) && (
              <div className="mt-4">
                <SlackContextSuggestions
                  suggestions={slackSuggestions}
                  loading={loadingSlackSuggestions}
                  onConfirm={handleSlackConfirm}
                  onSkip={handleSlackSkip}
                />
              </div>
            )}
          </div>

          {/* Context Actions (when analysis is active) */}
          {(nodes.length > 0 || (mode.type === 'scenario' && scenarioData.data) || (mode.type === 'strategy' && strategyData.data) || (mode.type === 'framework' && frameworkData.data)) && (
            <AnalysisToolbar
              mode={mode}
              hasAnalysis={nodes.length > 0}
              hasDocuments={hasDocuments}
              isExpertMode={isExpertMode}
              isGenerating={isGenerating}
              isGeneratingDeepLayer={isGeneratingDeepLayer}
              isSharing={isSharing}
              devilsAdvocateLoading={devilsAdvocateModal.loading}
              steelmanLoading={steelmanModal.loading}
              wargamingLoading={wargamingModal.loading}
              weirdLoading={weirdAnalysisModal.loading}
              scenarioLoading={scenarioData.loading}
              simulationRunning={simulation.state.status === 'running'}
              topicSuggestionLoading={topicSuggestionModal.loading}
              currentMaxOrder={currentMaxOrder}
              maxAllowedOrder={maxAllowedOrder}
              onTopicSuggestions={handleTopicSuggestions}
              onAddContext={() => setDataSourceBrowserOpen(true)}
              onRerunAnalysis={handleRerunAnalysis}
              onDevilsAdvocate={handleDevilsAdvocate}
              onSteelman={handleSteelman}
              onWargaming={handleWargaming}
              onGetWeird={handleGetWeird}
              onSimulation={handleOpenSimulation}
              onScenarioAnalysis={handleScenarioAnalysis}
              onShare={handleShareAnalysis}
              onAutoLayout={handleAutoLayout}
              onFitView={handleFitView}
              onDeepLayer={handleGenerateDeepLayer}
              onExportPowerPoint={handleExportPowerPoint}
              onExportWord={handleExportWord}
            />
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Graph Area / Scenario Display / Strategy Display */}
        <div className="flex-1 relative">
          {mode.type === 'scenario' ? (
            <ScenarioDisplayPanel
              data={scenarioData.data}
              loading={scenarioData.loading}
            />
          ) : mode.type === 'strategy' ? (
            <StrategyDisplayPanel
              data={strategyData.data}
              loading={strategyData.loading}
            />
          ) : mode.type === 'framework' ? (
            !selectedFramework ? (
              <FrameworkPicker onSelect={handleFrameworkSelect} />
            ) : (
              <FrameworkDisplayPanel
                data={frameworkData.data}
                framework={selectedFramework}
                loading={frameworkData.loading}
              />
            )
          ) : (
            <div className="relative h-full">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onInit={setReactFlowInstance}
                fitView
                style={{ background: 'var(--bg-deep)' }}
              >
                <Background variant="dots" gap={24} size={0.5} color="var(--text-muted)" />
                <Controls />
                <MiniMap />
              </ReactFlow>

              {/* Floating Loading Indicator */}
              {(isGenerating || isGeneratingDeepLayer) && (
                <div
                  className="absolute top-4 right-4 z-50 rounded-xl px-5 py-4 flex items-center gap-4 animate-pulse-gold"
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-accent)',
                    boxShadow: 'var(--shadow-medium)'
                  }}
                >
                  <div className="relative w-6 h-6">
                    <div
                      className="absolute inset-0 rounded-full animate-spin"
                      style={{
                        border: '2px solid var(--accent-gold)',
                        borderTopColor: 'transparent'
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-medium text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {isGeneratingDeepLayer ? 'Generating Deep Layer...' : 'Analyzing Decision...'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Claude is mapping consequences
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Commentary Panel */}
        <div className="w-[400px] cw-panel">
          <div className="cw-panel-header">
            <h2 className="font-display text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Strategic Commentary
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Real-time analysis as you explore
            </p>
          </div>
          {webSearchResults.searchResults.length > 0 && (
            <div className="px-4 pt-3">
              <WebSourcesPanel
                searchResults={webSearchResults.searchResults}
                queryCount={webSearchResults.queryCount}
                lastUpdated={webSearchResults.lastUpdated}
              />
            </div>
          )}
          <CommentaryPanel
            commentary={commentary}
            mode={mode}
            nodes={nodes}
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

      {/* Steelman Modal */}
      <SteelmanModal
        isOpen={steelmanModal.isOpen}
        onClose={handleCloseSteelman}
        data={steelmanModal.data}
        analysisType={mode.type}
        loading={steelmanModal.loading}
      />

      {/* Wargaming Modal */}
      <WargamingModal
        isOpen={wargamingModal.isOpen}
        onClose={handleCloseWargaming}
        actors={wargamingModal.actors}
        analysisContext={getAllRootInputs()}
        analysisType={mode.type}
        loading={wargamingModal.loading}
      />

      {/* Topic Suggestion Modal */}
      <TopicSuggestionModal
        isOpen={topicSuggestionModal.isOpen}
        onClose={handleCloseTopicSuggestions}
        data={topicSuggestionModal.data}
        loading={topicSuggestionModal.loading}
        onSelectTopic={handleSelectTopic}
      />

      {/* Drill-Down Modal (Deep Dive - Available in All Modes) */}
      <DrillDownModal
        isOpen={drillDownModal.isOpen}
        onClose={handleCloseDrillDown}
        onSave={handleDrillDownSave}
        focusNode={drillDownModal.focusNode}
        parentAnalysisType={mode.type}
        isExpertMode={isExpertMode}
      />

      {/* Weird Analysis Modal */}
      <WeirdAnalysisModal
        isOpen={weirdAnalysisModal.isOpen}
        onClose={handleCloseWeird}
        onAddWeirdNodes={handleAddWeirdNodes}
        data={weirdAnalysisModal.data}
        loading={weirdAnalysisModal.loading}
        analysisType={mode.type}
      />

      {/* Document Upload Panel */}
      <DocumentUploadPanel
        isOpen={uploadPanelOpen}
        onClose={() => setUploadPanelOpen(false)}
        onDocumentsChange={(count) => setHasDocuments(count > 0)}
      />

      {/* Data Source Browser */}
      <DataSourceBrowser
        isOpen={dataSourceBrowserOpen}
        onClose={() => setDataSourceBrowserOpen(false)}
        onImportContent={handleImportContent}
        hasDocuments={hasDocuments}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        mode={onboardingMode || 'decision'}
        isOpen={onboardingMode !== null}
        onClose={handleCloseOnboarding}
        onSkipAll={handleSkipAllOnboarding}
      />

      {/* Goal Clarifier Modal */}
      <GoalClarifierModal
        isOpen={goalClarifierOpen}
        onClose={handleCloseGoalClarifier}
        state={goalClarifier.state}
        onUpdateState={goalClarifier.updateState}
        onAnalyzeGoal={goalClarifier.analyzeGoal}
        onRefineGoal={goalClarifier.refineGoal}
        onUseGoal={handleUseGoal}
      />

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={simulationOpen}
        onClose={handleCloseSimulation}
        state={simulation.state}
        keyMomentAlert={simulation.keyMomentAlert}
        onStep={simulation.step}
        onToggleAutoplay={simulation.toggleAutoplay}
        onTogglePauseOnKeyMoments={simulation.togglePauseOnKeyMoments}
        onReset={simulation.reset}
        onContinueFromPause={simulation.continueFromPause}
        onUpdateGuidance={simulation.updateGuidance}
      />

    </div>
  )
}