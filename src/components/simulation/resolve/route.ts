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
    const actorMap = new Map(actors.map((a: Actor) => [a.id, a]))
    const formattedActions = actions.map((action: ActorAction) => {
      const actor = actorMap.get(action.actorId)
      const target = action.targetActorId ? actorMap.get(action.targetActorId) : null
      return {
        ...action,
        actorName: actor?.name || action.actorId,
        targetName: target?.name || action.targetActorId
      }
    })

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `You are the neutral arbiter/game master for a multi-actor simulation. Evaluate all simultaneous actions and determine outcomes.

ORIGINAL CONTEXT:
"${context}"

CURRENT STATE OF ACTORS:
${actors.map((a: Actor) => `
${a.name} (${a.type}):
- State: ${a.currentState}
- Resources: ${a.resources}/100
- Influence: ${a.influence}/100
- Goals: ${a.goals.join(', ')}
`).join('\n')}

ROUND ${currentRound} ACTIONS (all taken simultaneously):
${formattedActions.map((a: any) => `
${a.actorName}: ${a.actionType}${a.targetName ? ` → ${a.targetName}` : ''} (intensity: ${a.intensity})
Reasoning: ${a.reasoning}
Expected: ${a.expectedOutcome}
`).join('\n')}

${previousRounds.length > 0 ? `
PREVIOUS ROUNDS SUMMARY:
${previousRounds.slice(-3).map((r: RoundResult) => `Round ${r.round}: ${r.narrativeSummary}`).join('\n')}
` : ''}

Your task:
1. Identify any CONFLICTS between actions (actors working against each other)
2. Determine the OUTCOME of each conflict
3. Calculate STATE CHANGES for each actor (resources, influence, state, relationships)
4. Identify any KEY MOMENTS that warrant attention
5. Generate AI RECOMMENDATIONS for the next round
6. Write a NARRATIVE SUMMARY of what happened
7. Assess overall EQUILIBRIUM STATUS

KEY MOMENT TYPES (only flag if truly significant):
- major_shift: Power balance changes significantly
- conflict_peak: Conflict escalates without resolution
- alliance_formed: New alliance created
- alliance_broken: Alliance ends
- inflection_point: Critical decision point reached
- cascade_risk: Risk of chain reaction
- actor_eliminated: Actor exits simulation
- goal_achieved: Major goal accomplished

Return ONLY valid JSON:
{
  "conflicts": [
    {
      "id": "conflict_1",
      "actorIds": ["actor_1", "actor_2"],
      "conflictType": "direct_opposition",
      "description": "What happened",
      "resolution": "How it was resolved",
      "winner": "actor_1",
      "loser": "actor_2",
      "outcome": "decisive"
    }
  ],
  "stateChanges": [
    {
      "actorId": "actor_1",
      "field": "resources",
      "previousValue": 70,
      "newValue": 65,
      "reason": "Cost of action"
    }
  ],
  "keyMoments": [
    {
      "id": "moment_1",
      "type": "major_shift",
      "round": ${currentRound},
      "description": "What happened and why it matters",
      "significance": "major",
      "involvedActors": ["actor_1"],
      "implications": ["What this means going forward"],
      "shouldPause": true
    }
  ],
  "recommendations": [
    {
      "id": "rec_1",
      "targetActor": "actor_1",
      "suggestedAction": "negotiate",
      "reasoning": "Why this is advisable",
      "expectedImpact": "What could happen",
      "riskLevel": "medium",
      "urgency": "high"
    }
  ],
  "narrativeSummary": "2-3 sentence summary of round ${currentRound}",
  "equilibriumStatus": "shifting",
  "isComplete": false,
  "completionReason": null
}

conflictType: direct_opposition, resource_competition, goal_interference, chain_reaction
outcome: decisive, stalemate, partial, escalated
significance: minor, moderate, major, critical
equilibriumStatus: stable, unstable, shifting, volatile
isComplete: true if simulation should end (all goals achieved, all actors eliminated, stalemate reached)

Be realistic but dramatic. Let consequences flow naturally from actions. Don't be afraid to let actors fail or succeed based on their choices and circumstances.`
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
      // Return a basic result
      result = {
        conflicts: [],
        stateChanges: [],
        keyMoments: [],
        recommendations: [],
        narrativeSummary: `Round ${currentRound}: Actions were taken but outcomes remain uncertain.`,
        equilibriumStatus: 'shifting',
        isComplete: false
      }
    }

    // Apply state changes to actors
    const updatedActors = applyStateChanges(actors, result.stateChanges || [], actions)

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
      narrativeSummary: result.narrativeSummary || `Round ${currentRound} completed.`,
      recommendations,
      equilibriumStatus: result.equilibriumStatus || 'shifting'
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
      completionReason: result.completionReason
    })
  } catch (error) {
    console.error('Simulation resolve error:', error)
    return NextResponse.json(
      { error: 'Failed to resolve simulation round' },
      { status: 500 }
    )
  }
}

function applyStateChanges(actors: Actor[], stateChanges: StateChange[], actions: ActorAction[]): Actor[] {
  const actorsCopy: Actor[] = JSON.parse(JSON.stringify(actors))

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
          round: 0, // Will be set correctly
          previousState: prevState,
          newState: actor.currentState,
          reason: change.reason
        })
        break
      case 'relationships':
        // Handle relationship changes if needed
        break
    }
  }

  return actorsCopy
}
