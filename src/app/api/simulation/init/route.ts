import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import { Actor } from '@/types/simulation'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { context, actors: preDefinedActors } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    if (!context?.trim()) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are an expert at scenario analysis, game theory, and behavioral modeling. Your task is to create REALISTIC actors who behave like actual humans and organizations - with all their biases, self-interest, paranoia, and conflicting incentives.

CONTEXT:
"${context}"

CRITICAL: Real actors are NOT cooperative by default. They are:
- Self-interested first and foremost
- Suspicious of others' motives
- Protective of their resources and status
- Prone to cognitive biases
- Driven by ego, fear, and ambition as much as rational calculation

Create 3-6 actors with DISTINCT and CONFLICTING perspectives. Each actor MUST have:

1. PERSONALITY ARCHETYPE (shapes all decisions):
   - aggressive_opportunist: Takes risks, exploits weakness, moves fast
   - cautious_defender: Protects position, risk-averse, reactive
   - ideological_zealot: Principles over pragmatism, won't compromise core beliefs
   - calculating_pragmatist: Pure self-interest, will betray if beneficial
   - status_quo_guardian: Resists change, institutional loyalty
   - disruptive_revolutionary: Wants to overturn existing order
   - wounded_revanchist: Nursing grievances, seeking payback

2. PRIVATE AGENDA (hidden goals they won't admit publicly):
   - What they REALLY want vs what they SAY they want
   - Personal ambitions that conflict with stated mission
   - Old grudges they're waiting to settle

3. BLIND SPOTS & BIASES:
   - What information do they ignore or discount?
   - Who do they underestimate or overestimate?
   - What past trauma shapes their worldview?

4. RISK TOLERANCE: risk_seeking, risk_neutral, risk_averse

5. DECISION STYLE:
   - impulsive: Acts on emotion, decides quickly
   - analytical: Slow, methodical, over-thinks
   - intuitive: Goes with gut, pattern-matching
   - ideological: Filters everything through worldview

6. TRUST DISPOSITION:
   - paranoid: Assumes others are plotting against them
   - conditional: Trust must be earned through action
   - naive: Too trusting, easily exploited

7. RELATIONSHIP DYNAMICS (not just ally/rival - include):
   - Historical betrayals
   - Debt/obligations owed
   - Competing for same resources/position
   - Personal animosity vs institutional alliance

Return ONLY valid JSON:
{
  "actors": [
    {
      "id": "actor_1",
      "name": "Specific Name",
      "type": "organization",
      "personalityArchetype": "calculating_pragmatist",
      "publicGoals": ["What they claim to want"],
      "privateAgenda": ["What they actually want", "Hidden ambitions"],
      "blindSpots": ["What they fail to see", "Who they underestimate"],
      "riskTolerance": "risk_neutral",
      "decisionStyle": "analytical",
      "trustDisposition": "conditional",
      "resources": 70,
      "influence": 60,
      "traits": ["Specific behavioral trait", "Another trait"],
      "fears": ["What they're afraid of losing", "Worst case scenario"],
      "relationships": [
        {
          "targetActorId": "actor_2",
          "type": "rival",
          "strength": -30,
          "history": "Brief history of this relationship",
          "privateFeeling": "What they really think of this actor"
        }
      ],
      "currentState": "active",
      "stateHistory": []
    }
  ],
  "initialTensions": ["Existing conflict 1", "Simmering dispute 2"],
  "initialState": "Description of starting situation emphasizing tensions and competing interests"
}

RELATIONSHIP TYPES: ally, rival, neutral, dependent, adversary, frenemy (public ally, private rival)
STRENGTH: -100 (blood enemies) to +100 (unconditional allies)
- Most relationships should be in -50 to +50 range (conditional, not absolute)
- Even allies should have some tension points

IMPORTANT:
- Make actors feel REAL, not like game theory robots
- Give them human flaws, ego, and irrationality
- Ensure at least 2 actors have fundamentally incompatible goals
- Include at least one actor who is NOT what they appear to be
- Every actor should have reason to distrust at least one other actor`
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : responseText

    let result
    try {
      result = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      result = {
        actors: [
          {
            id: uuidv4(),
            name: 'Primary Stakeholder',
            type: 'organization',
            personalityArchetype: 'calculating_pragmatist',
            publicGoals: ['Achieve stated objective'],
            privateAgenda: ['Expand personal power', 'Sideline competitors'],
            blindSpots: ['Underestimates opposition resilience'],
            riskTolerance: 'risk_neutral',
            decisionStyle: 'analytical',
            trustDisposition: 'conditional',
            resources: 70,
            influence: 65,
            traits: ['Strategic', 'Self-interested'],
            fears: ['Loss of position', 'Public failure'],
            relationships: [],
            currentState: 'active',
            stateHistory: []
          },
          {
            id: uuidv4(),
            name: 'Opposition Leader',
            type: 'organization',
            personalityArchetype: 'wounded_revanchist',
            publicGoals: ['Protect stakeholder interests'],
            privateAgenda: ['Payback for past defeats', 'Prove doubters wrong'],
            blindSpots: ['Sees conspiracy where none exists'],
            riskTolerance: 'risk_seeking',
            decisionStyle: 'impulsive',
            trustDisposition: 'paranoid',
            resources: 60,
            influence: 55,
            traits: ['Aggressive', 'Grudge-holding'],
            fears: ['Irrelevance', 'Being outmaneuvered again'],
            relationships: [],
            currentState: 'active',
            stateHistory: []
          }
        ],
        initialTensions: ['Historical grievances unresolved', 'Competition for same resources'],
        initialState: 'Scenario initialized with stakeholders in tense standoff.'
      }
    }

    // Map extended actor model to base Actor type while preserving extra fields
    result.actors = result.actors.map((actor: any) => ({
      id: actor.id || uuidv4(),
      name: actor.name || 'Unknown Actor',
      type: actor.type || 'organization',
      goals: actor.publicGoals || actor.goals || [],
      resources: actor.resources ?? 50,
      influence: actor.influence ?? 50,
      traits: actor.traits || [],
      relationships: (actor.relationships || []).map((r: any) => ({
        targetActorId: r.targetActorId,
        type: r.type,
        strength: r.strength,
        history: r.history,
        privateFeeling: r.privateFeeling
      })),
      currentState: actor.currentState || 'active',
      stateHistory: actor.stateHistory || [],
      // Extended personality fields
      personalityArchetype: actor.personalityArchetype || 'calculating_pragmatist',
      privateAgenda: actor.privateAgenda || [],
      blindSpots: actor.blindSpots || [],
      riskTolerance: actor.riskTolerance || 'risk_neutral',
      decisionStyle: actor.decisionStyle || 'analytical',
      trustDisposition: actor.trustDisposition || 'conditional',
      fears: actor.fears || []
    }))

    // Add relationship references between actors
    const actorIds = result.actors.map((a: Actor) => a.id)
    result.actors = result.actors.map((actor: any) => ({
      ...actor,
      relationships: actor.relationships.filter((r: any) =>
        actorIds.includes(r.targetActorId)
      )
    }))

    return NextResponse.json({
      simulationId: uuidv4(),
      actors: result.actors,
      initialState: result.initialState,
      initialTensions: result.initialTensions || []
    })
  } catch (error) {
    console.error('Simulation init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize simulation' },
      { status: 500 }
    )
  }
}
