export interface DecisionNode {
  id: string
  type: 'interactive' // React Flow node type
  data: {
    label: string
    description?: string
    order: number // 0 = root, 1 = first order, 2 = second order
    nodeType: 'decision' | 'consequence' | 'forecast' // Semantic type for business logic
    probability?: number // For forecast mode: probability this cause contributed (0-100)
    sentiment?: 'positive' | 'negative' | 'neutral' // Impact sentiment for visual indicators
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
  type: 'decision' | 'forecast' | 'scenario' | 'strategy'
  rootInput: string
}

export interface StrategyFramework {
  ends: {
    objectives: Array<{
      objective: string
      specificity: string
      metrics: string[]
      timeframe: string
      achievability: 'under-scoped' | 'appropriate' | 'over-scoped'
    }>
    internalConsistency: string
    hiddenObjectives: string[]
    failureModes: string[]
  }
  ways: {
    approaches: Array<{
      approach: string
      causalLogic: string
      executionRisk: 'low' | 'medium' | 'high'
      resourceIntensity: 'low' | 'medium' | 'high'
      novelty: 'orthodox' | 'innovative' | 'unproven'
    }>
    alternatives: string[]
    integration: string
    adversaryConsiderations: string[]
  }
  means: {
    resources: Array<{
      resource: string
      sufficiency: 'adequate' | 'insufficient' | 'excessive'
      readiness: 'immediate' | 'short-term' | 'long-term'
      fungibility: 'high' | 'medium' | 'low'
      dependencies: string[]
    }>
    capabilityGaps: string[]
    hiddenCosts: string[]
    concentrationRisks: string[]
  }
  risks: {
    riskFactors: Array<{
      risk: string
      category: 'execution' | 'environmental' | 'adversary' | 'second-order'
      probability: number
      impact: 'low' | 'medium' | 'high'
      mitigation: string
      earlyWarning: string[]
    }>
    interconnectedRisks: string[]
    underestimatedRisk: string
  }
  assumptions: {
    criticalAssumptions: Array<{
      assumption: string
      testability: 'high' | 'medium' | 'low'
      fragility: 'robust' | 'moderate' | 'fragile'
      monitoring: string[]
    }>
    contradictions: string[]
    vulnerabilities: string
  }
  integration: {
    criticalPath: string
    theoryOfVictory: string
    topVulnerabilities: string[]
    stressTestScenarios: string[]
  }
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