import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { goal } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Build context from all the goal clarifier inputs
    const context = buildGoalContext(goal)

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
      max_tokens: 5000,
      messages: [{
        role: 'user',
        content: `You are an expert goal-setting coach. Based on the information gathered, synthesize a refined, actionable goal statement.

ORIGINAL RAW GOAL:
"${goal.rawInput}"

GATHERED INFORMATION:
${context}

Your task:
1. Create a clear, comprehensive goal statement that incorporates all the specifics gathered
2. Break down the goal using SMART criteria
3. Identify key assumptions that must hold true for success
4. Estimate a success probability (0-100) based on the information provided

The refined goal statement should be:
- Specific and concrete
- Include measurable success criteria
- Reference the timeline and deadline
- Acknowledge key constraints
- Be written in active, actionable language

Return ONLY valid JSON with this structure:
{
  "refinedGoal": {
    "statement": "A comprehensive 2-4 sentence goal statement that captures what, by when, measured by what, and key constraints",
    "smartBreakdown": {
      "specific": "What exactly will be accomplished",
      "measurable": "How success will be measured",
      "achievable": "Why this is realistic given resources",
      "relevant": "Why this matters and connects to larger goals",
      "timeBound": "The deadline and key milestones"
    },
    "keyAssumptions": [
      "Assumption 1 that must hold true",
      "Assumption 2 that must hold true",
      "Assumption 3 that must hold true"
    ],
    "successProbability": 75,
    "confidenceLevel": "medium"
  }
}

confidenceLevel should be "low" (below 40%), "medium" (40-70%), or "high" (above 70%) based on how well-defined the goal is.`
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
      // Return a fallback response
      result = {
        refinedGoal: {
          statement: `Achieve "${goal.rawInput}" by ${goal.timeline?.deadline || 'the target deadline'}, measuring success by defined criteria and working within resource constraints.`,
          smartBreakdown: {
            specific: goal.specificity?.concreteOutcome || 'Outcome to be defined',
            measurable: goal.successCriteria?.length > 0 ? 'Success criteria defined' : 'Metrics to be defined',
            achievable: 'Resources and constraints assessed',
            relevant: 'Aligned with organizational goals',
            timeBound: goal.timeline?.deadline || 'Timeline to be set'
          },
          keyAssumptions: [
            'Required resources will be available',
            'Key stakeholders remain supportive',
            'External conditions remain stable'
          ],
          successProbability: 60,
          confidenceLevel: 'medium'
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Goal clarifier refine error:', error)
    return NextResponse.json(
      { error: 'Failed to refine goal' },
      { status: 500 }
    )
  }
}

function buildGoalContext(goal: any): string {
  const sections: string[] = []

  // Specificity
  if (goal.specificity) {
    sections.push(`SPECIFICITY:
- Concrete Outcome: ${goal.specificity.concreteOutcome || 'Not specified'}
- Scope: ${goal.specificity.scope || 'Not specified'}
- Out of Scope: ${goal.specificity.outOfScope?.join(', ') || 'Not specified'}
- Stakeholders: ${goal.specificity.stakeholders?.map((s: any) => `${s.name} (${s.role}, ${s.disposition})`).join(', ') || 'Not specified'}`)
  }

  // Success Criteria
  if (goal.successCriteria?.length > 0) {
    const criteriaList = goal.successCriteria.map((c: any) =>
      `- ${c.metric}: Min=${c.minimum}, Ideal=${c.ideal}, Measured by=${c.measurementMethod}`
    ).join('\n')
    sections.push(`SUCCESS CRITERIA:\n${criteriaList}`)
  }

  // Resources & Constraints
  if (goal.resources) {
    const constraints = goal.resources.constraints?.map((c: any) =>
      `- ${c.type}: ${c.description} (Available: ${c.available}, Required: ${c.required}, Flexibility: ${c.flexibility})`
    ).join('\n') || 'None specified'

    const blockers = goal.resources.blockers?.map((b: any) =>
      `- ${b.severity}: ${b.description}${b.mitigation ? ` (Mitigation: ${b.mitigation})` : ''}`
    ).join('\n') || 'None specified'

    const dependencies = goal.resources.dependencies?.join(', ') || 'None specified'

    sections.push(`RESOURCES & CONSTRAINTS:
Constraints:
${constraints}

Potential Blockers:
${blockers}

Dependencies: ${dependencies}`)
  }

  // Timeline
  if (goal.timeline) {
    const milestones = goal.timeline.milestones?.map((m: any) =>
      `- ${m.description} (Target: ${m.targetDate}${m.isCheckpoint ? ', Checkpoint' : ''})`
    ).join('\n') || 'None specified'

    const risks = goal.timeline.riskToTimeline?.join(', ') || 'None specified'

    sections.push(`TIMELINE:
- Deadline: ${goal.timeline.deadline || 'Not specified'}
- Buffer Time: ${goal.timeline.bufferTime || 'Not specified'}

Milestones:
${milestones}

Risks to Timeline: ${risks}`)
  }

  return sections.join('\n\n')
}
