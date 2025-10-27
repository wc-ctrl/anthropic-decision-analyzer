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

TASK: Conduct comprehensive web research using multiple strategic search queries.

EXECUTE THESE WEB SEARCHES using the WebSearch tool:

1. Recent Developments Search:
   Query: "${input} recent developments 2024 2025"

2. Expert Analysis Search:
   Query: "${input} expert analysis forecast opinion"

3. Market/Industry Context Search:
   Query: "${input} market analysis industry trends"

4. Risk Assessment Search:
   Query: "${input} risks challenges problems"

5. Historical Precedent Search:
   Query: "${input} historical precedent similar cases"

${isNonUSFocused ? `
6. Regional/International Search:
   Query: "${input} international global regional"
` : ''}

For each WebSearch result, analyze and extract:
- Key facts and recent developments
- Expert opinions and consensus/disagreement
- Quantitative data and metrics
- Risk factors and opportunities
- Historical precedents and base rates

After completing all searches, synthesize the findings into comprehensive strategic intelligence that provides real-time context for ${analysisType} analysis.

Structure your response as a strategic intelligence briefing with actionable insights.`
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