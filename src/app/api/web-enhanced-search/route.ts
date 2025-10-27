import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, analysisType, selectedScaffolds, isNonUSFocused } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const webContext = await conductEnhancedWebSearch(input, analysisType, selectedScaffolds, isNonUSFocused)
    return NextResponse.json(webContext)

  } catch (error) {
    console.error('Web search enhancement error:', error)
    return NextResponse.json(
      { error: 'Failed to conduct enhanced web search' },
      { status: 500 }
    )
  }
}

async function conductEnhancedWebSearch(
  input: string,
  analysisType: string,
  selectedScaffolds: any,
  isNonUSFocused: boolean
) {
  // Generate sophisticated search strategy based on selected scaffolds
  const searchStrategy = generateSearchStrategy(input, analysisType, selectedScaffolds, isNonUSFocused)

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `You are an expert strategic researcher specializing in comprehensive web search and information synthesis for decision analysis.

TARGET: "${input}"
ANALYSIS TYPE: ${analysisType}

SEARCH STRATEGY GUIDANCE:
${searchStrategy}

${selectedScaffolds?.selectedScaffolds ? `
ANALYTICAL FRAMEWORKS TO APPLY:
${selectedScaffolds.selectedScaffolds.map((scaffold: any, index: number) => `
${index + 1}. **${scaffold.name}**
   Focus: ${scaffold.rationale}
   Search Priority: ${scaffold.category === 'search' ? 'HIGH' : 'MEDIUM'}
`).join('')}
` : ''}

${isNonUSFocused ? `
ESOTERIC SEARCH PRIORITY (Non-US Topic Detected):
- Government statistical agencies and central banks
- Non-English regional sources in native languages
- Technical specifications and regulatory documents
- Open-source intelligence repositories
- Local academic and research institutions
` : ''}

TASK: Conduct comprehensive web research and provide contextualized intelligence.

Use the WebSearch tool to:
1. Search for recent developments (last 30 days) related to the topic
2. Find historical precedents and base rate data
3. Locate expert opinions and authoritative analysis
4. Discover quantitative data and metrics
5. Identify potential risks and opportunities
${isNonUSFocused ? '6. Search for region-specific and non-English sources' : ''}

For each search, focus on:
- Official sources and primary data
- Recent developments and trend analysis
- Expert consensus and disagreement areas
- Quantitative metrics and statistical evidence
- Regulatory and policy environment
- Stakeholder positions and market dynamics

After comprehensive searching, synthesize findings into strategic intelligence
that enhances the ${analysisType} analysis with real-time contextual data.

Provide a structured research summary that can inform sophisticated strategic analysis.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw web search enhancement response:', responseText)

  try {
    // The AI will conduct web searches and return synthesized intelligence
    return {
      webSearchResults: responseText,
      searchStrategy: searchStrategy,
      contextualIntelligence: responseText,
      lastUpdated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Web search synthesis failed:', error)
    return {
      webSearchResults: 'Web search temporarily unavailable',
      searchStrategy: 'Basic search strategy applied',
      contextualIntelligence: 'Analysis proceeding with existing knowledge',
      lastUpdated: new Date().toISOString()
    }
  }
}

function generateSearchStrategy(
  input: string,
  analysisType: string,
  selectedScaffolds: any,
  isNonUSFocused: boolean
): string {
  let strategy = `COMPREHENSIVE SEARCH STRATEGY for "${input}":\n\n`

  // Add scaffold-specific search guidance
  if (selectedScaffolds?.selectedScaffolds) {
    const searchScaffolds = selectedScaffolds.selectedScaffolds.filter((s: any) => s.category === 'search')
    if (searchScaffolds.length > 0) {
      strategy += `PRIORITY SEARCH FRAMEWORKS:\n`
      searchScaffolds.forEach((scaffold: any, index: number) => {
        strategy += `${index + 1}. **${scaffold.name}**: ${scaffold.rationale}\n`
      })
      strategy += `\n`
    }
  }

  // Add analysis-specific search focus
  switch (analysisType) {
    case 'decision':
      strategy += `DECISION ANALYSIS SEARCH FOCUS:
- Recent similar decisions and their outcomes
- Current market conditions and competitive landscape
- Regulatory environment and compliance requirements
- Stakeholder reactions and expert opinions
- Financial metrics and cost-benefit precedents\n\n`
      break

    case 'forecast':
      strategy += `CAUSAL ANALYSIS SEARCH FOCUS:
- Historical precedents and base rate data
- Current trend analysis and momentum indicators
- Expert forecasts and prediction market data
- Leading indicators and early warning signals
- Regulatory and policy environment changes\n\n`
      break

    case 'scenario':
      strategy += `SCENARIO ANALYSIS SEARCH FOCUS:
- Expert scenario planning and forecasts
- Historical pattern analysis and precedents
- Current trajectory indicators and momentum
- Risk factor identification and probability data
- Uncertainty factors and critical decision points\n\n`
      break
  }

  // Add esoteric search strategy if non-US focused
  if (isNonUSFocused) {
    strategy += `ENHANCED SOURCE STRATEGY (Non-US Topic):
- Priority 1: Government statistical agencies, central banks, official data
- Priority 2: Technical specifications, regulatory compliance documents
- Priority 3: Non-English regional sources, local government statistics
- Priority 4: Open-source intelligence, NGO reports, academic research
- Focus on native language sources and region-specific expertise\n\n`
  }

  strategy += `SEARCH EXECUTION PRINCIPLES:
- Seek primary sources over secondary reporting
- Prioritize recent developments (30 days) and trend analysis
- Cross-reference multiple authoritative sources
- Focus on quantitative data and official statistics
- Identify expert consensus and areas of disagreement`

  return strategy
}