export interface DecisionNode {
  id: string
  type: 'interactive' // React Flow node type
  data: {
    label: string
    description?: string
    order: number // 0 = root, 1 = first order, 2 = second order
    nodeType: 'decision' | 'consequence' | 'forecast' // Semantic type for business logic
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
}

export interface AnalysisMode {
  type: 'decision' | 'forecast'
  rootInput: string
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