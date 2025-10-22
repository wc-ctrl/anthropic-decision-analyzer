export interface DecisionNode {
  id: string
  type: 'interactive' // React Flow node type
  data: {
    label: string
    description?: string
    order: number // 0 = root, 1 = first order, 2 = second order
    nodeType: 'decision' | 'consequence' | 'forecast' // Semantic type for business logic
    probability?: number // For forecast mode: probability this cause contributed (0-100)
    isEditing?: boolean
  }
  position: { x: number; y: number }
}

export interface DecisionEdge {
  id: string
  source: string
  target: string
  type: 'smoothstep'
  animated?: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
  }
}

export interface AnalysisMode {
  type: 'decision' | 'forecast' | 'scenario'
  rootInput: string
}

export interface ScenarioSignpost {
  id: string
  text: string
  timeframe: string
  confidence: number
  tier: 1 | 2 | 3 | 4 | 5
}

export interface ScenarioTrack {
  probability: 100 | 80 | 60 | 40 | 20 | 0
  label: 'Maximally Likely' | 'Very Likely' | 'Somewhat Likely' | 'Somewhat Unlikely' | 'Very Unlikely' | 'Maximally Unlikely'
  signposts: ScenarioSignpost[]
  description: string
}

export interface ScenarioAnalysis {
  targetOutcome: string
  tracks: ScenarioTrack[]
  methodology: string
  keyUncertainties: string[]
}

export interface Commentary {
  id: string
  content: string
  timestamp: Date
  triggeredBy: 'nodeEdit' | 'nodeAdd' | 'nodeDelete' | 'initialAnalysis'
  relatedNodes: string[]
}

export interface DecisionAnalysis {
  nodes: DecisionNode[]
  edges: DecisionEdge[]
  commentary: Commentary[]
  mode: AnalysisMode
}