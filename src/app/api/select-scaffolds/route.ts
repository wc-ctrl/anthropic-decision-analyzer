import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import promptScaffoldsData from '@/data/promptScaffolds.json'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, analysisType } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const selectedScaffolds = await selectOptimalScaffolds(topic, analysisType)
    return NextResponse.json(selectedScaffolds)

  } catch (error) {
    console.error('Scaffold selection error:', error)
    return NextResponse.json(
      { error: 'Failed to select optimal scaffolds' },
      { status: 500 }
    )
  }
}

async function selectOptimalScaffolds(topic: string, analysisType: string) {
  // Combine all available scaffolds
  const allScaffolds = [
    ...promptScaffoldsData.searchStrategies,
    ...promptScaffoldsData.reasoningStrategies,
    ...promptScaffoldsData.nudgingStrategies
  ]

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert analytical framework selector specializing in optimal prompt scaffold selection for strategic analysis.

ANALYSIS TOPIC: "${topic}"
ANALYSIS TYPE: ${analysisType}

AVAILABLE SCAFFOLDS:
${allScaffolds.map((scaffold, index) => `
${index + 1}. **${scaffold.name}** (${scaffold.category}, ${scaffold.complexity} complexity)
   Applicability: ${scaffold.applicability?.join(', ') || 'general'}
   Description: ${scaffold.description.substring(0, 200)}...
`).join('')}

Your task is to analyze the topic and select the 5 MOST APPROPRIATE scaffolds that would enhance the analysis quality for this specific topic and analysis type.

Consider:
1. Topic complexity and analytical requirements
2. Information availability and research needs
3. Uncertainty levels and forecasting challenges
4. Strategic importance and decision stakes
5. Time horizon and implementation factors

IMPORTANT: Return ONLY valid JSON with this structure:
{
  "selectedScaffolds": [
    {
      "id": "scaffold_id",
      "name": "Scaffold Name",
      "category": "search/reasoning/nudging",
      "rationale": "Why this scaffold is optimal for this topic (2-3 sentences)",
      "priority": 1
    }
  ],
  "topicAnalysis": {
    "complexity": "low/medium/high",
    "informationAvailability": "low/medium/high",
    "timeHorizon": "short/medium/long",
    "stakeholderComplexity": "low/medium/high",
    "uncertaintyLevel": "low/medium/high"
  },
  "analyticalApproach": "Recommended analytical approach summary for this topic",
  "isNonUSFocused": false
}

Select scaffolds that complement each other and provide comprehensive analytical coverage.
Prioritize frameworks that match the topic's complexity and analytical requirements.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw scaffold selection response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    const selection = JSON.parse(jsonText)

    // Validate and enrich selected scaffolds with full descriptions
    if (selection.selectedScaffolds) {
      selection.selectedScaffolds = selection.selectedScaffolds.map((selected: any) => {
        const fullScaffold = allScaffolds.find(s => s.id === selected.id)
        return {
          ...selected,
          fullDescription: fullScaffold?.description || selected.description,
          complexity: fullScaffold?.complexity || 'medium',
          applicability: fullScaffold?.applicability || []
        }
      })
    }

    // Add esoteric search if non-US focused
    if (selection.isNonUSFocused) {
      selection.esotericSearchStrategy = promptScaffoldsData.esotericSearchStrategy
    }

    return selection

  } catch (error) {
    console.error('JSON parsing failed for scaffold selection:', error)

    // Fallback to default high-value scaffolds
    return {
      selectedScaffolds: [
        {
          id: 'base_rate_consideration',
          name: 'Consider the base rate',
          category: 'nudging',
          rationale: 'Essential baseline for any forecasting analysis',
          priority: 1
        },
        {
          id: 'factor_tree_decomposition',
          name: 'Factor Tree Decomposition',
          category: 'reasoning',
          rationale: 'Systematic breakdown for complex decisions',
          priority: 2
        }
      ],
      topicAnalysis: {
        complexity: 'medium',
        informationAvailability: 'medium',
        timeHorizon: 'medium',
        stakeholderComplexity: 'medium',
        uncertaintyLevel: 'medium'
      },
      analyticalApproach: 'Multi-factor analysis with baseline considerations',
      isNonUSFocused: false
    }
  }
}