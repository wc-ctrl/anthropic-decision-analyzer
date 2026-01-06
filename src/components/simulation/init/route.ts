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
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: `You are an expert at scenario analysis and stakeholder mapping. Analyze this context and identify the key actors involved.

CONTEXT:
"${context}"

Your task:
1. Identify 3-6 key actors (individuals, organizations, governments, groups, or abstract forces) that would be involved in this scenario
2. For each actor, determine their:
   - Type (individual, organization, government, group, or abstract)
   - Goals (what they want to achieve)
   - Starting resources (0-100 scale)
   - Starting influence (0-100 scale)
   - Key traits that drive behavior
   - Relationships with other actors

Consider diverse perspectives: supporters, opponents, neutral parties, and external forces.

Return ONLY valid JSON with this structure:
{
  "actors": [
    {
      "id": "actor_1",
      "name": "Actor Name",
      "type": "organization",
      "goals": ["Primary goal", "Secondary goal"],
      "resources": 70,
      "influence": 60,
      "traits": ["Trait 1", "Trait 2"],
      "relationships": [
        {
          "targetActorId": "actor_2",
          "type": "ally",
          "strength": 50
        }
      ],
      "currentState": "active",
      "stateHistory": []
    }
  ],
  "initialState": "Brief description of the starting situation and dynamics"
}

Relationship types: ally, rival, neutral, dependent, adversary
Relationship strength: -100 to 100 (negative = hostile, positive = friendly)
Actor types: individual, organization, government, group, abstract`
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
      // Return a fallback with generic actors
      result = {
        actors: [
          {
            id: uuidv4(),
            name: 'Primary Stakeholder',
            type: 'organization',
            goals: ['Achieve stated objective', 'Maintain position'],
            resources: 70,
            influence: 65,
            traits: ['Strategic', 'Resourceful'],
            relationships: [],
            currentState: 'active',
            stateHistory: []
          },
          {
            id: uuidv4(),
            name: 'Opposition',
            type: 'organization',
            goals: ['Counter primary objective', 'Protect interests'],
            resources: 60,
            influence: 55,
            traits: ['Competitive', 'Defensive'],
            relationships: [],
            currentState: 'active',
            stateHistory: []
          },
          {
            id: uuidv4(),
            name: 'External Force',
            type: 'abstract',
            goals: ['Maintain stability', 'Enforce norms'],
            resources: 80,
            influence: 75,
            traits: ['Regulatory', 'Influential'],
            relationships: [],
            currentState: 'active',
            stateHistory: []
          }
        ],
        initialState: 'Scenario initialized with primary stakeholders in active state.'
      }
    }

    // Ensure all actors have IDs and required fields
    result.actors = result.actors.map((actor: Partial<Actor>) => ({
      id: actor.id || uuidv4(),
      name: actor.name || 'Unknown Actor',
      type: actor.type || 'organization',
      goals: actor.goals || [],
      resources: actor.resources ?? 50,
      influence: actor.influence ?? 50,
      traits: actor.traits || [],
      relationships: actor.relationships || [],
      currentState: actor.currentState || 'active',
      stateHistory: actor.stateHistory || []
    }))

    // Add relationship references between actors
    const actorIds = result.actors.map((a: Actor) => a.id)
    result.actors = result.actors.map((actor: Actor) => ({
      ...actor,
      relationships: actor.relationships.filter((r: any) =>
        actorIds.includes(r.targetActorId)
      )
    }))

    return NextResponse.json({
      simulationId: uuidv4(),
      actors: result.actors,
      initialState: result.initialState
    })
  } catch (error) {
    console.error('Simulation init error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize simulation' },
      { status: 500 }
    )
  }
}
