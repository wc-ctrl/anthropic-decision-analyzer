import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

interface SearchResult {
  title: string
  url: string
  snippet: string
  source: string
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '')
  } catch {
    return url
  }
}

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

    const searchStrategy = generateSearchStrategy(input, analysisType, selectedScaffolds, isNonUSFocused)

    // Use Claude's built-in web search tool for real-time web results
    const searchPrompt = buildSearchPrompt(input, analysisType, selectedScaffolds, isNonUSFocused)

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
      max_tokens: 8000,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 8,
        } as Anthropic.Tool,
      ],
      messages: [{
        role: 'user',
        content: searchPrompt,
      }],
    })

    // Extract search results and text from the response
    const searchResults: SearchResult[] = []
    let contextualIntelligence = ''

    // Log block types for debugging
    console.log('Web search response block types:', message.content.map(b => b.type))

    for (const block of message.content) {
      // Handle any block that might contain search results
      const anyBlock = block as Record<string, unknown>

      if (block.type === 'web_search_tool_result' || block.type === 'server_tool_result') {
        // Direct search results on the block
        const results = (anyBlock.search_results || anyBlock.results) as Array<{
          title?: string; url?: string; snippet?: string; page_age?: string
        }> | undefined
        if (results) {
          for (const result of results) {
            if (result.url && !searchResults.find(r => r.url === result.url)) {
              searchResults.push({
                title: result.title || 'Untitled',
                url: result.url,
                snippet: result.snippet || '',
                source: extractDomain(result.url),
              })
            }
          }
        }
        // Check for nested content array (some API versions nest results inside content)
        const content = anyBlock.content as Array<Record<string, unknown>> | undefined
        if (content && Array.isArray(content)) {
          for (const item of content) {
            if (item.type === 'web_search_result' && item.url) {
              const url = item.url as string
              if (!searchResults.find(r => r.url === url)) {
                searchResults.push({
                  title: (item.title as string) || 'Untitled',
                  url,
                  snippet: (item.snippet as string) || (item.page_age as string) || '',
                  source: extractDomain(url),
                })
              }
            }
          }
        }
      } else if (block.type === 'text') {
        // Extract citations/URLs from text blocks
        const textBlock = anyBlock as { text: string; citations?: Array<{ url?: string; title?: string }> }
        contextualIntelligence += textBlock.text

        // Extract URLs from citations if present
        if (textBlock.citations) {
          for (const citation of textBlock.citations) {
            if (citation.url && !searchResults.find(r => r.url === citation.url)) {
              searchResults.push({
                title: citation.title || 'Web Source',
                url: citation.url,
                snippet: '',
                source: extractDomain(citation.url),
              })
            }
          }
        }
      }
    }

    if (!contextualIntelligence) {
      contextualIntelligence = 'Web search completed but no synthesis was generated.'
    }

    return NextResponse.json({
      searchResults,
      contextualIntelligence,
      searchStrategy,
      lastUpdated: new Date().toISOString(),
      queryCount: searchResults.length,
    })

  } catch (error) {
    console.error('Web search enhancement error:', error)
    // Return graceful fallback so analysis can still proceed
    return NextResponse.json({
      searchResults: [],
      contextualIntelligence: 'Web search temporarily unavailable. Analysis proceeding with model knowledge.',
      searchStrategy: 'Fallback: no web search',
      lastUpdated: new Date().toISOString(),
      queryCount: 0,
    })
  }
}

function buildSearchPrompt(
  input: string,
  analysisType: string,
  selectedScaffolds: { selectedScaffolds?: Array<{ name: string; rationale: string }> } | undefined,
  isNonUSFocused: boolean
): string {
  let prompt = `You are a strategic intelligence analyst. Search the web for current, relevant information to support ${analysisType || 'decision'} analysis of: "${input}"

SEARCH STRATEGY:
1. Search for recent news and developments related to this topic
2. Search for expert analysis and data
3. Search for risks, challenges, and counterarguments
4. Search for relevant market conditions or competitive context

${isNonUSFocused ? 'This is a non-US focused topic. Prioritize international and regional sources, government data, and local expert analysis.\n' : ''}`

  if (selectedScaffolds?.selectedScaffolds) {
    prompt += `\nANALYTICAL FRAMEWORKS TO INFORM YOUR SEARCH:\n`
    selectedScaffolds.selectedScaffolds.forEach((s, i) => {
      prompt += `${i + 1}. ${s.name}: ${s.rationale}\n`
    })
  }

  prompt += `
After searching, synthesize your findings into a concise strategic intelligence briefing covering:
- Key facts and recent developments (with dates when available)
- Expert consensus and areas of disagreement
- Quantitative data and metrics when available
- Risk factors and opportunities
- Historical precedents and base rates

Be direct, factual, and actionable. Focus on insights most relevant to ${analysisType || 'decision'} analysis. Cite specific sources when making claims.`

  return prompt
}

function generateSearchStrategy(
  input: string,
  analysisType: string,
  selectedScaffolds: { selectedScaffolds?: Array<{ name: string; rationale: string; category: string }> } | undefined,
  isNonUSFocused: boolean
): string {
  let strategy = `COMPREHENSIVE SEARCH STRATEGY for "${input}":\n\n`

  if (selectedScaffolds?.selectedScaffolds) {
    const searchScaffolds = selectedScaffolds.selectedScaffolds.filter(s => s.category === 'search')
    if (searchScaffolds.length > 0) {
      strategy += `PRIORITY SEARCH FRAMEWORKS:\n`
      searchScaffolds.forEach((scaffold, index) => {
        strategy += `${index + 1}. **${scaffold.name}**: ${scaffold.rationale}\n`
      })
      strategy += `\n`
    }
  }

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

  if (isNonUSFocused) {
    strategy += `ENHANCED SOURCE STRATEGY (Non-US Topic):
- Priority 1: Government statistical agencies, central banks, official data
- Priority 2: Technical specifications, regulatory compliance documents
- Priority 3: Non-English regional sources, local government statistics
- Priority 4: Open-source intelligence, NGO reports, academic research
- Focus on native language sources and region-specific expertise\n\n`
  }

  strategy += `SEARCH EXECUTION: Claude web search tool with up to 8 queries.
- Seeking primary sources over secondary reporting
- Prioritizing recent developments and trend analysis
- Cross-referencing multiple authoritative sources`

  return strategy
}
