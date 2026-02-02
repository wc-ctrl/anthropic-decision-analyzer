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
  actor: any, // Extended actor with personality fields
  allActors: any[],
  currentRound: number,
  previousRounds: RoundResult[],
  userGuidance?: string
): Promise<ActorAction | null> {
  try {
    const otherActors = allActors.filter(a => a.id !== actor.id && a.currentState !== 'eliminated')
    const recentHistory = previousRounds.slice(-3)

    // Build relationship context with history and private feelings
    const relationshipContext = actor.relationships.map((r: any) => {
      const target = allActors.find(a => a.id === r.targetActorId)
      if (!target) return ''
      return `- ${target.name}: ${r.type} (strength: ${r.strength})
    History: ${r.history || 'No significant history'}
    Your private assessment: ${r.privateFeeling || 'Neutral'}
    Their current state: Resources ${target.resources}, Influence ${target.influence}`
    }).filter(Boolean).join('\n')

    // Analyze recent actions against this actor
    const recentThreats = recentHistory.flatMap(r =>
      r.actions.filter(a => a.targetActorId === actor.id &&
        ['attack', 'compete', 'escalate'].includes(a.actionType))
    )

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You ARE ${actor.name}. Not simulating - you ARE this actor. Think and decide as they would.

=== WHO YOU ARE ===
Name: ${actor.name}
Type: ${actor.type}
Personality: ${actor.personalityArchetype?.toUpperCase() || 'CALCULATING_PRAGMATIST'}
${getPersonalityDescription(actor.personalityArchetype)}

Decision Style: ${actor.decisionStyle || 'analytical'}
Risk Tolerance: ${actor.riskTolerance || 'risk_neutral'}
Trust Level: ${actor.trustDisposition || 'conditional'}

=== YOUR SITUATION ===
Resources: ${actor.resources}/100 ${actor.resources < 30 ? '⚠️ CRITICALLY LOW' : actor.resources < 50 ? '⚠️ Concerning' : ''}
Influence: ${actor.influence}/100
Current State: ${actor.currentState}

=== WHAT YOU WANT ===
PUBLIC GOALS (what you tell others):
${actor.goals.map((g: string) => `• ${g}`).join('\n')}

PRIVATE AGENDA (what you REALLY want - never admit this):
${(actor.privateAgenda || []).map((g: string) => `• ${g}`).join('\n') || '• Maximize your own position'}

YOUR FEARS (what keeps you up at night):
${(actor.fears || []).map((f: string) => `• ${f}`).join('\n') || '• Losing what you have'}

YOUR BLIND SPOTS (you don't realize these):
${(actor.blindSpots || []).map((b: string) => `• ${b}`).join('\n') || '• You think you see the full picture'}

=== YOUR RELATIONSHIPS ===
${relationshipContext || 'You trust no one fully.'}

=== OTHER PLAYERS ===
${otherActors.map(a => `${a.name} (${a.type}): ${a.currentState}
  Resources: ${a.resources}, Influence: ${a.influence}
  Their goals: ${a.goals.slice(0, 2).join(', ')}
  Personality: ${a.personalityArchetype || 'unknown'}
  ${a.trustDisposition === 'paranoid' ? '⚠️ Known to be paranoid/suspicious' : ''}
  ${a.riskTolerance === 'risk_seeking' ? '⚠️ Risk-taker, may act aggressively' : ''}`).join('\n\n')}

${recentThreats.length > 0 ? `
=== RECENT THREATS AGAINST YOU ===
${recentThreats.map(t => {
  const attacker = allActors.find(a => a.id === t.actorId)
  return `• ${attacker?.name || 'Someone'} ${t.actionType}ed you (intensity: ${t.intensity})`
}).join('\n')}
` : ''}

${recentHistory.length > 0 ? `
=== WHAT HAPPENED RECENTLY ===
${recentHistory.map(r => `Round ${r.round}: ${r.narrativeSummary}`).join('\n')}
` : 'This is Round 1. Everyone is watching to see who moves first.'}

${userGuidance ? `
=== EXTERNAL PRESSURE (consider this) ===
${userGuidance}
` : ''}

=== ROUND ${currentRound}: WHAT DO YOU DO? ===

THINK THROUGH THIS AS ${actor.name.toUpperCase()}:
1. What serves YOUR interests (not the group's)?
2. Who might be plotting against you?
3. Can you exploit anyone's weakness?
4. What's the REAL reason you'd cooperate (there must be clear self-benefit)?
5. Given your personality (${actor.personalityArchetype}), what feels right?

COOPERATION WARNING: You should NOT cooperate unless:
- You get clear, tangible benefit
- You're too weak to do otherwise
- It's a trap for the other party
- It advances your PRIVATE agenda

Available actions:
cooperate, compete, negotiate, defend, attack, wait, signal, withdraw, escalate, de-escalate, form_alliance, break_alliance, resource_acquisition, resource_transfer, information_share, information_withhold

Return ONLY valid JSON:
{
  "actorId": "${actor.id}",
  "actionType": "your_chosen_action",
  "targetActorId": "id_of_target_or_null",
  "intensity": 1-10,
  "reasoning": "Your ACTUAL reasoning as this character (can be selfish/petty)",
  "hiddenMotivation": "The real reason you're doing this (be honest here)",
  "resourceCost": 0-20,
  "expectedOutcome": "What you hope happens",
  "contingency": "Your backup plan if this fails",
  "emotionalState": "How you're feeling (angry, fearful, confident, paranoid, etc.)"
}`
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
      contingency: action.contingency,
      // Extended fields
      hiddenMotivation: action.hiddenMotivation,
      emotionalState: action.emotionalState
    }
  } catch (error) {
    console.error(`Error generating action for ${actor.name}:`, error)
    return {
      actorId: actor.id,
      actionType: 'defend',
      intensity: 5,
      reasoning: 'Protecting position while assessing threats',
      resourceCost: 2,
      expectedOutcome: 'Maintain current standing'
    }
  }
}

function getPersonalityDescription(archetype: string): string {
  const descriptions: Record<string, string> = {
    aggressive_opportunist: `You see weakness and you EXPLOIT it. Hesitation is for losers. Strike first, strike hard. Every interaction is a chance to gain advantage. You respect strength and despise weakness.`,

    cautious_defender: `The world is dangerous and you've learned to protect what's yours. Change is usually bad. Better to hold position than risk losing everything. You've seen others overreach and fail.`,

    ideological_zealot: `Your principles are NOT negotiable. Others call you rigid but you call it having a spine. Compromise with evil is still evil. You'd rather lose fighting for what's right than win by selling out.`,

    calculating_pragmatist: `Loyalty is a luxury. Alliances are temporary. The only constant is self-interest, and you're honest about yours. You'll work with anyone - and betray anyone - if the math works out.`,

    status_quo_guardian: `The system works. Radicals and reformers will destroy everything trying to "improve" it. Your job is to preserve stability, even if it means supporting imperfect institutions.`,

    disruptive_revolutionary: `The current order benefits the powerful at everyone else's expense. It needs to BURN. You're not here to negotiate with a corrupt system - you're here to replace it.`,

    wounded_revanchist: `They wronged you. They humiliated you. They thought you'd stay down. Every move you make is about payback and proving them wrong. You have a long memory.`
  }

  return descriptions[archetype] || descriptions.calculating_pragmatist
}
