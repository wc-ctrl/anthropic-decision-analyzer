import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionNode } from '@/types/decision'
import intuitionPumps from '@/data/intuitionPumps.json'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, analysisType, existingNodes, isExpertMode, webContext } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const weirdAnalysis = await generateWeirdAnalysis(
      input,
      analysisType,
      existingNodes,
      isExpertMode,
      webContext
    )

    return NextResponse.json(weirdAnalysis)

  } catch (error) {
    console.error('Get Weird analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate weird analysis' },
      { status: 500 }
    )
  }
}

async function generateWeirdAnalysis(
  input: string,
  analysisType: string,
  existingNodes: DecisionNode[],
  isExpertMode: boolean,
  webContext?: any
) {
  // First, select the most appropriate intuition pumps
  const selectedPumps = await selectIntuitionPumps(input, analysisType, existingNodes)

  const existingNodesSummary = existingNodes
    .filter(n => n.data.order > 0)
    .map(n => `- ${n.data.label} (${n.data.sentiment || 'neutral'}) - ${n.data.description || ''}`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are an expert strategic analyst specializing in unconventional thinking and overlooked possibilities. Your role is to surface plausible but non-obvious implications that executives might dismiss too quickly.

TARGET: "${input}"
ANALYSIS TYPE: ${analysisType}

EXISTING ANALYSIS NODES:
${existingNodesSummary || 'No existing analysis'}

SELECTED INTUITION PUMPS:
${selectedPumps.map((pump, index) => `
${index + 1}. **${pump.name}**
   Framework: ${pump.description}
   Thinking Prompt: ${pump.prompt}
`).join('')}

${webContext ? `
REAL-TIME WEB CONTEXT:
${webContext.contextualIntelligence?.substring(0, 500) || 'Web intelligence available'}
` : ''}

TASK: Generate 1-2 "weird" but plausible ${analysisType === 'decision' ? 'consequences' : 'causal factors'} that:

1. **Have non-zero probability** (5-25% chance) but might be dismissed
2. **Surface diagnostic signals** others might overlook
3. **Challenge conventional assumptions** about likely outcomes
4. **Reveal subtle but important dynamics** not in standard analysis
5. **Use the intuition pumps** to generate unconventional insights

REQUIREMENTS:
- Must be plausible and grounded in reality (not fantasy)
- Should have clear mechanisms for how they could occur
- Focus on subtle, overlooked, or counter-intuitive possibilities
- Include probability estimates and reasoning
- Explain why conventional analysis might miss these

Return ONLY valid JSON with this structure:
{
  "weirdNodes": [
    {
      "id": "weird-1",
      "data": {
        "label": "Unconventional but plausible outcome",
        "description": "Detailed explanation of mechanism and why it could happen",
        "order": 2,
        "nodeType": "${analysisType === 'decision' ? 'consequence' : 'forecast'}",
        "sentiment": "negative",
        "probability": 15,
        "isWeird": true
      },
      "mechanism": "Clear explanation of how this could occur",
      "diagnosticSignals": ["Early warning sign 1", "Signal that this is happening"],
      "whyOverlooked": "Why conventional analysis misses this",
      "intuitionPump": "${selectedPumps[0]?.name || 'Unconventional thinking'}"
    }
  ],
  "weirdnessRationale": "Overall explanation of why these unconventional possibilities matter for strategic thinking",
  "diagnosticValue": "How these insights provide early warning capabilities or reveal blind spots",
  "probabilityJustification": "Why these low-probability events deserve strategic consideration"
}

Focus on intellectually rigorous unconventional thinking that reveals diagnostic signals and blind spots.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw weird analysis response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for weird analysis:', error)

    // Fallback weird analysis
    return {
      weirdNodes: [
        {
          id: 'weird-fallback',
          data: {
            label: 'Unexpected systemic feedback effects',
            description: 'The decision triggers second-order system responses that amplify or reverse intended outcomes through complex feedback loops.',
            order: 2,
            nodeType: analysisType === 'decision' ? 'consequence' : 'forecast',
            sentiment: 'neutral',
            probability: 20,
            isWeird: true
          },
          mechanism: 'Complex system interactions create feedback loops',
          diagnosticSignals: ['Unusual stakeholder reactions', 'Unexpected metric correlations'],
          whyOverlooked: 'Standard analysis focuses on direct effects, missing system complexity',
          intuitionPump: 'Second-Order Effects Amplification'
        }
      ],
      weirdnessRationale: 'Conventional analysis may miss complex system dynamics and feedback effects',
      diagnosticValue: 'Provides early warning signals for unexpected system responses',
      probabilityJustification: 'Low-probability scenarios often have high diagnostic value for strategic blind spots'
    }
  }
}

async function selectIntuitionPumps(input: string, analysisType: string, existingNodes: DecisionNode[]) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `You are an expert in cognitive frameworks and unconventional thinking patterns.

TASK: Select the 2 most appropriate intuition pumps for generating unconventional insights.

INPUT: "${input}"
ANALYSIS TYPE: ${analysisType}

AVAILABLE INTUITION PUMPS:
${intuitionPumps.intuitionPumps.map((pump, index) => `${index + 1}. **${pump.name}**: ${pump.description}`).join('\n')}

Select the 2 pumps most likely to reveal overlooked but important possibilities for this specific decision/forecast.

Return ONLY a JSON array with the selected pump IDs:
["pump_id_1", "pump_id_2"]`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const selectedIds = JSON.parse(responseText)
    return selectedIds.map((id: string) =>
      intuitionPumps.intuitionPumps.find(pump => pump.id === id)
    ).filter(Boolean)
  } catch (error) {
    // Fallback to first two pumps
    return intuitionPumps.intuitionPumps.slice(0, 2)
  }
}