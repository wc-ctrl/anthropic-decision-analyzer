import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Actor, ActorAction, RoundResult } from '@/types/simulation'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { simulationId, actors, currentRound, previousRounds, userGuidance } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Generate actions for all actors in parallel
    const actionPromises = actors
      .filter((actor: Actor) => actor.currentState !== 'eliminated')
      .map((actor: Actor) => generateActorAction(actor, actors, currentRound, previousRounds, userGuidance))

    const actions = await Promise.all(actionPromises)

    return NextResponse.json({
      actions: actions.filter(Boolean)
    })
  } catch (error) {
    console.error('Simulation step error:', error)
    return NextResponse.json(
      { error: 'Failed to generate actor actions' },
      { status: 500 }
    )
  }
}

async function generateActorAction(
  actor: Actor,
  allActors: Actor[],
  currentRound: number,
  previousRounds: RoundResult[],
  userGuidance?: string
): Promise<ActorAction | null> {
  try {
    const otherActors = allActors.filter(a => a.id !== actor.id && a.currentState !== 'eliminated')
    const recentHistory = previousRounds.slice(-3) // Last 3 rounds for context

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are simulating the decision-making of this actor in a multi-actor scenario.

YOU ARE: ${actor.name}
Type: ${actor.type}
Goals: ${actor.goals.join(', ')}
Current State: ${actor.currentState}
Resources: ${actor.resources}/100
Influence: ${actor.influence}/100
Traits: ${actor.traits.join(', ')}

YOUR RELATIONSHIPS:
${actor.relationships.map(r => {
  const target = allActors.find(a => a.id === r.targetActorId)
  return target ? `- ${target.name}: ${r.type} (strength: ${r.strength})` : ''
}).filter(Boolean).join('\n') || 'No established relationships'}

OTHER ACTORS IN PLAY:
${otherActors.map(a => `- ${a.name} (${a.type}): ${a.currentState}, Resources: ${a.resources}, Influence: ${a.influence}`).join('\n')}

${recentHistory.length > 0 ? `
RECENT HISTORY:
${recentHistory.map(r => `Round ${r.round}: ${r.narrativeSummary}`).join('\n')}
` : 'No prior history - this is round 1.'}

${userGuidance ? `
USER GUIDANCE (consider this direction):
${userGuidance}
` : ''}

Round ${currentRound}: What action do you take?

Available action types:
- cooperate: Work together with another actor
- compete: Try to gain advantage over another actor
- negotiate: Attempt to reach agreement
- defend: Protect your position/resources
- attack: Directly oppose/harm another actor
- wait: Hold position and observe
- signal: Send message/signal intentions
- withdraw: Pull back from engagement
- escalate: Increase intensity of conflict
- de-escalate: Reduce tensions
- form_alliance: Create formal partnership
- break_alliance: End existing partnership
- resource_acquisition: Gain resources
- resource_transfer: Give resources to another
- information_share: Reveal information
- information_withhold: Keep information secret

Return ONLY valid JSON:
{
  "actorId": "${actor.id}",
  "actionType": "cooperate",
  "targetActorId": "id_of_target_actor_or_null",
  "intensity": 5,
  "reasoning": "Brief explanation of why this action",
  "resourceCost": 5,
  "expectedOutcome": "What you expect to happen",
  "contingency": "What if it fails"
}

intensity: 1-10 (1=minimal effort, 10=all-out)
resourceCost: 0-20 (how much this action costs)
targetActorId: Include if action is directed at specific actor, null otherwise`
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : responseText

    const action = JSON.parse(jsonText)
    return {
      actorId: actor.id,
      actionType: action.actionType || 'wait',
      targetActorId: action.targetActorId || undefined,
      intensity: action.intensity || 5,
      reasoning: action.reasoning || 'Strategic decision',
      resourceCost: action.resourceCost || 0,
      expectedOutcome: action.expectedOutcome || 'Unknown',
      contingency: action.contingency
    }
  } catch (error) {
    console.error(`Error generating action for ${actor.name}:`, error)
    // Return a default wait action if AI fails
    return {
      actorId: actor.id,
      actionType: 'wait',
      intensity: 3,
      reasoning: 'Observing situation before acting',
      resourceCost: 0,
      expectedOutcome: 'Gather more information'
    }
  }
}
