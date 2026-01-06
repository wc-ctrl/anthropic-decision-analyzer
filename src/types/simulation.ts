// Simulation Types for Anticipatory Intelligence feature

export type SimulationStatus =
  | 'idle'
  | 'initializing'
  | 'ready'
  | 'running'
  | 'step_phase'
  | 'resolve_phase'
  | 'paused'
  | 'completed'
  | 'error'

export type KeyMomentType =
  | 'major_shift'
  | 'conflict_peak'
  | 'alliance_formed'
  | 'alliance_broken'
  | 'inflection_point'
  | 'cascade_risk'
  | 'actor_eliminated'
  | 'goal_achieved'
  | 'unexpected_outcome'

export type ActionType =
  | 'cooperate'
  | 'compete'
  | 'negotiate'
  | 'defend'
  | 'attack'
  | 'wait'
  | 'signal'
  | 'withdraw'
  | 'escalate'
  | 'de-escalate'
  | 'form_alliance'
  | 'break_alliance'
  | 'resource_acquisition'
  | 'resource_transfer'
  | 'information_share'
  | 'information_withhold'

export interface Actor {
  id: string
  name: string
  type: 'organization' | 'individual' | 'government' | 'group' | 'abstract'
  goals: string[]
  resources: number // 0-100 scale
  influence: number // 0-100 scale
  relationships: ActorRelationship[]
  traits: string[]
  currentState: 'active' | 'weakened' | 'strengthened' | 'eliminated'
  stateHistory: ActorStateChange[]
}

export interface ActorRelationship {
  targetActorId: string
  type: 'ally' | 'rival' | 'neutral' | 'dependent' | 'adversary'
  strength: number // -100 to 100, negative = hostile, positive = friendly
}

export interface ActorStateChange {
  round: number
  previousState: Actor['currentState']
  newState: Actor['currentState']
  reason: string
}

export interface ActorAction {
  actorId: string
  actionType: ActionType
  targetActorId?: string
  intensity: number // 1-10 scale
  reasoning: string
  resourceCost: number
  expectedOutcome: string
  contingency?: string
}

export interface ActionConflict {
  id: string
  actorIds: string[]
  conflictType: 'direct_opposition' | 'resource_competition' | 'goal_interference' | 'chain_reaction'
  description: string
  resolution: string
  winner?: string
  loser?: string
  outcome: 'decisive' | 'stalemate' | 'partial' | 'escalated'
}

export interface StateChange {
  actorId: string
  field: 'resources' | 'influence' | 'currentState' | 'relationships'
  previousValue: unknown
  newValue: unknown
  reason: string
}

export interface KeyMoment {
  id: string
  type: KeyMomentType
  round: number
  description: string
  significance: 'minor' | 'moderate' | 'major' | 'critical'
  involvedActors: string[]
  implications: string[]
  shouldPause: boolean
}

export interface RecommendedStep {
  id: string
  targetActor: string
  suggestedAction: ActionType
  reasoning: string
  expectedImpact: string
  riskLevel: 'low' | 'medium' | 'high'
  urgency: 'low' | 'medium' | 'high'
}

export interface RoundResult {
  round: number
  actions: ActorAction[]
  conflicts: ActionConflict[]
  stateChanges: StateChange[]
  keyMoments: KeyMoment[]
  narrativeSummary: string
  recommendations: RecommendedStep[]
  equilibriumStatus: 'stable' | 'unstable' | 'shifting' | 'volatile'
}

export interface SimulationState {
  id: string
  status: SimulationStatus
  context: string // Original analysis input
  actors: Actor[]
  rounds: RoundResult[]
  currentRound: number
  maxRounds: number
  autoplayEnabled: boolean
  pauseOnKeyMoments: boolean
  userGuidance?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

// API Request/Response types

export interface SimulationInitRequest {
  context: string
  actors?: Partial<Actor>[] // Optional pre-defined actors
  maxRounds?: number
}

export interface SimulationInitResponse {
  simulationId: string
  actors: Actor[]
  initialState: string
}

export interface SimulationStepRequest {
  simulationId: string
  actors: Actor[]
  currentRound: number
  previousRounds: RoundResult[]
  userGuidance?: string
}

export interface SimulationStepResponse {
  actions: ActorAction[]
}

export interface SimulationResolveRequest {
  simulationId: string
  actors: Actor[]
  currentRound: number
  actions: ActorAction[]
  previousRounds: RoundResult[]
  context: string
}

export interface SimulationResolveResponse {
  roundResult: RoundResult
  updatedActors: Actor[]
  shouldPause: boolean
  pauseReason?: KeyMoment
  isComplete: boolean
  completionReason?: string
}

export interface SimulationAutoplayRequest {
  simulationId: string
  state: SimulationState
  maxSteps?: number
}

export interface SimulationAutoplayResponse {
  rounds: RoundResult[]
  finalActors: Actor[]
  stoppedReason: 'max_rounds' | 'key_moment' | 'completion' | 'max_steps'
  keyMoment?: KeyMoment
}
