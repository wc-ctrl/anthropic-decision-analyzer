import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'
import { Actor, ActorAction, RoundResult, ActionConflict, StateChange, KeyMoment, RecommendedStep } from '@/types/simulation'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { simulationId, actors, currentRound, actions, previousRounds, context } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Format actors and actions for the resolver
    const actorMap = new Map(actors.map((a: any) => [a.id, a]))
    const formattedActions = actions.map((action: ActorAction & { hiddenMotivation?: string; emotionalState?: string }) => {
      const actor = actorMap.get(action.actorId) as any
      const target = action.targetActorId ? actorMap.get(action.targetActorId) as any : null
      return {
        ...action,
        actorName: actor?.name || action.actorId,
        actorPersonality: actor?.personalityArchetype || 'unknown',
        targetName: target?.name || action.targetActorId,
        targetPersonality: target?.personalityArchetype
      }
    })

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: `You are resolving a round of a REALISTIC multi-actor simulation. Your job is to determine what ACTUALLY happens when these actors' actions collide.

CRITICAL PRINCIPLES:
1. CONFLICT IS NORMAL - Don't artificially resolve tensions. Real conflicts persist.
2. COOPERATION IS RARE - When actors cooperate, someone usually benefits more.
3. TRUST IS HARD TO BUILD - One cooperative act doesn't create allies.
4. BETRAYAL IS COMMON - Especially from calculating_pragmatist and aggressive_opportunist types.
5. PERSONALITY MATTERS - A wounded_revanchist won't just "get over it."
6. POWER DYNAMICS - Strong actors often exploit weak ones, even "allies."
7. INFORMATION IS IMPERFECT - Actors often misread each other's intentions.

ORIGINAL CONTEXT:
"${context}"

CURRENT ACTOR STATES:
${actors.map((a: any) => `
${a.name} (${a.type}):
- Personality: ${a.personalityArchetype || 'calculating_pragmatist'}
- State: ${a.currentState}
- Resources: ${a.resources}/100
- Influence: ${a.influence}/100
- Public Goals: ${a.goals?.join(', ')}
- Private Agenda: ${(a.privateAgenda || []).join(', ') || 'Unknown'}
- Trust Disposition: ${a.trustDisposition || 'conditional'}
- Fears: ${(a.fears || []).join(', ') || 'Unknown'}
`).join('\n')}

ROUND ${currentRound} ACTIONS (simultaneous):
${formattedActions.map((a: any) => `
${a.actorName} [${a.actorPersonality}]: ${a.actionType}${a.targetName ? ` → ${a.targetName}` : ''} (intensity: ${a.intensity})
  Stated reasoning: ${a.reasoning}
  Hidden motivation: ${a.hiddenMotivation || 'Unknown'}
  Emotional state: ${a.emotionalState || 'Unknown'}
  Expected outcome: ${a.expectedOutcome}
`).join('\n')}

${previousRounds.length > 0 ? `
HISTORY (recent):
${previousRounds.slice(-3).map((r: RoundResult) => `Round ${r.round}: ${r.narrativeSummary}
  Equilibrium: ${r.equilibriumStatus}`).join('\n')}
` : 'Round 1 - No history yet. Actors are sizing each other up.'}

YOUR TASK - Resolve this round REALISTICALLY:

1. CONFLICTS: Identify where actors are working against each other.
   - Direct opposition: Both can't win
   - Resource competition: Fighting over same thing
   - Goal interference: One's success hurts another
   - Consider personality clashes (zealot vs pragmatist, etc.)

2. OUTCOMES: Determine winners/losers based on:
   - Resources and influence (but not deterministically!)
   - Personality fit for the action (aggressive types better at attacking)
   - Risk taken vs reward gained
   - Lucky/unlucky breaks (add some randomness)

3. STATE CHANGES: Calculate realistic consequences:
   - Winning costs resources too (pyrrhic victories are real)
   - Failed cooperation breeds resentment
   - Successful aggression invites retaliation
   - Influence shifts based on perception, not just reality

4. RELATIONSHIP CHANGES: How do actors view each other now?
   - Did anyone reveal their true colors?
   - Were there perceived betrayals?
   - Did attempted cooperation actually build trust? (Usually not immediately)

5. KEY MOMENTS: Only flag truly significant events:
   - major_shift, conflict_peak, alliance_formed, alliance_broken
   - inflection_point, cascade_risk, actor_eliminated, goal_achieved

6. EQUILIBRIUM: How stable is the situation?
   - stable: No major tensions, unlikely to change
   - unstable: Tensions exist but contained
   - shifting: Active changes underway
   - volatile: Could explode any moment

IMPORTANT:
- Don't be a peacemaker. Let conflicts simmer and escalate.
- Cooperation attempts often fail or backfire.
- Winning isn't free - it creates enemies and costs resources.
- Personality archetypes should STRONGLY influence outcomes.
- Add drama and unexpected consequences.

Return ONLY valid JSON:
{
  "conflicts": [
    {
      "id": "conflict_1",
      "actorIds": ["actor_1", "actor_2"],
      "conflictType": "direct_opposition",
      "description": "What happened between them",
      "resolution": "How it played out (not necessarily 'resolved')",
      "winner": "actor_id_or_null",
      "loser": "actor_id_or_null",
      "outcome": "decisive|stalemate|partial|escalated",
      "futureTension": "What this means for their relationship going forward"
    }
  ],
  "stateChanges": [
    {
      "actorId": "actor_1",
      "field": "resources|influence|currentState|relationships",
      "previousValue": 70,
      "newValue": 60,
      "reason": "Why this changed"
    }
  ],
  "relationshipShifts": [
    {
      "actor1": "actor_id",
      "actor2": "actor_id",
      "previousStrength": 20,
      "newStrength": -10,
      "reason": "Why the relationship changed"
    }
  ],
  "keyMoments": [
    {
      "id": "moment_1",
      "type": "conflict_peak",
      "round": ${currentRound},
      "description": "What happened and why it matters",
      "significance": "minor|moderate|major|critical",
      "involvedActors": ["actor_1"],
      "implications": ["What this means going forward"],
      "shouldPause": true
    }
  ],
  "recommendations": [
    {
      "id": "rec_1",
      "targetActor": "actor_1",
      "suggestedAction": "action_type",
      "reasoning": "Strategic advice",
      "expectedImpact": "What could happen",
      "riskLevel": "low|medium|high",
      "urgency": "low|medium|high"
    }
  ],
  "narrativeSummary": "2-4 sentence dramatic summary of Round ${currentRound}. Include tension, conflict, and consequences.",
  "equilibriumStatus": "stable|unstable|shifting|volatile",
  "unresolvedTensions": ["Tension that will continue to next round", "Another simmering issue"],
  "isComplete": false,
  "completionReason": null
}

isComplete ONLY if:
- All but one actor eliminated
- A decisive victory makes continuation pointless
- Complete stalemate with no possible moves
- 10+ rounds of unchanging deadlock`
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
        conflicts: [],
        stateChanges: [],
        relationshipShifts: [],
        keyMoments: [],
        recommendations: [],
        narrativeSummary: `Round ${currentRound}: Tensions simmer as actors maneuver for position. No clear resolution emerges.`,
        equilibriumStatus: 'unstable',
        unresolvedTensions: ['Multiple actors pursuing incompatible goals'],
        isComplete: false
      }
    }

    // Apply state changes to actors
    const updatedActors = applyStateChanges(actors, result.stateChanges || [], actions, result.relationshipShifts || [])

    // Ensure IDs on all items
    const conflicts: ActionConflict[] = (result.conflicts || []).map((c: any) => ({
      ...c,
      id: c.id || uuidv4()
    }))

    const keyMoments: KeyMoment[] = (result.keyMoments || []).map((m: any) => ({
      ...m,
      id: m.id || uuidv4(),
      round: currentRound
    }))

    const recommendations: RecommendedStep[] = (result.recommendations || []).map((r: any) => ({
      ...r,
      id: r.id || uuidv4()
    }))

    const roundResult: RoundResult = {
      round: currentRound,
      actions: actions,
      conflicts,
      stateChanges: result.stateChanges || [],
      keyMoments,
      narrativeSummary: result.narrativeSummary || `Round ${currentRound} completed with ongoing tensions.`,
      recommendations,
      equilibriumStatus: result.equilibriumStatus || 'unstable'
    }

    // Check if should pause
    const shouldPause = keyMoments.some(m => m.shouldPause)
    const pauseReason = keyMoments.find(m => m.shouldPause)

    return NextResponse.json({
      roundResult,
      updatedActors,
      shouldPause,
      pauseReason,
      isComplete: result.isComplete || false,
      completionReason: result.completionReason,
      unresolvedTensions: result.unresolvedTensions || []
    })
  } catch (error) {
    console.error('Simulation resolve error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve simulation round' },
      { status: 500 }
    )
  }
}

function applyStateChanges(
  actors: any[],
  stateChanges: StateChange[],
  actions: ActorAction[],
  relationshipShifts: any[]
): any[] {
  const actorsCopy: any[] = JSON.parse(JSON.stringify(actors))

  // Apply resource costs from actions
  for (const action of actions) {
    const actor = actorsCopy.find(a => a.id === action.actorId)
    if (actor && action.resourceCost) {
      actor.resources = Math.max(0, actor.resources - action.resourceCost)
    }
  }

  // Apply state changes from resolver
  for (const change of stateChanges) {
    const actor = actorsCopy.find(a => a.id === change.actorId)
    if (!actor) continue

    switch (change.field) {
      case 'resources':
        actor.resources = Math.max(0, Math.min(100, Number(change.newValue)))
        break
      case 'influence':
        actor.influence = Math.max(0, Math.min(100, Number(change.newValue)))
        break
      case 'currentState':
        const prevState = actor.currentState
        actor.currentState = change.newValue as Actor['currentState']
        actor.stateHistory.push({
          round: 0,
          previousState: prevState,
          newState: actor.currentState,
          reason: change.reason
        })
        break
    }
  }

  // Apply relationship shifts
  for (const shift of relationshipShifts) {
    const actor = actorsCopy.find(a => a.id === shift.actor1)
    if (!actor) continue

    const existingRel = actor.relationships?.find((r: any) => r.targetActorId === shift.actor2)
    if (existingRel) {
      existingRel.strength = shift.newStrength
      existingRel.history = (existingRel.history || '') + ` | Round: ${shift.reason}`
    } else if (actor.relationships) {
      actor.relationships.push({
        targetActorId: shift.actor2,
        type: shift.newStrength > 20 ? 'ally' : shift.newStrength < -20 ? 'rival' : 'neutral',
        strength: shift.newStrength,
        history: shift.reason
      })
    }
  }

  return actorsCopy
}
