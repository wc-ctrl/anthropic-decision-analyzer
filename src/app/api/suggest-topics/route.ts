import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { useSlack = true, useGDrive = true } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Get user context from MCP sources
    let userContext = null
    const sources = []
    if (useSlack) sources.push('slack')
    if (useGDrive) sources.push('gdrive')

    if (sources.length > 0) {
      try {
        const contextResponse = await fetch(`${request.url.split('/api')[0]}/api/mcp/get-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'recent strategic discussions and decision topics',
            sources
          })
        })

        if (contextResponse.ok) {
          const contextResult = await contextResponse.json()
          userContext = contextResult.context
        }
      } catch (error) {
        console.log('Context retrieval failed for topic suggestions:', error)
      }
    }

    const suggestions = await generateTopicSuggestions(userContext)
    return NextResponse.json(suggestions)

  } catch (error) {
    console.error('Topic suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to generate topic suggestions' },
      { status: 500 }
    )
  }
}

async function generateTopicSuggestions(userContext?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are an expert strategic intelligence analyst specializing in personalized strategic analysis topic generation. Your role is to analyze user activity and generate relevant, high-value strategic analysis suggestions.

${userContext ? `
USER CONTEXT from organizational sources:

Recent Slack Activity:
${userContext.slack ? userContext.slack.map((msg: any) => `- ${msg.channel}: ${msg.content}`).join('\n') : 'Limited Slack data available'}

Google Drive Documents:
${userContext.gdrive ? userContext.gdrive.map((doc: any) => `- ${doc.fileName}: ${doc.excerpt}`).join('\n') : 'Limited Google Drive data available'}

Based on this user activity and organizational context, generate personalized suggestions.
` : `
No specific user context available. Generate general high-value strategic analysis topics relevant to executive decision-making, technology strategy, and business planning.
`}

Generate 5 strategic analysis topic suggestions across three categories:
1. Decision Analysis suggestions (2 topics)
2. Causal/Forecast Analysis suggestions (2 topics)
3. Scenario Analysis suggestions (1 topic)

For each suggestion, provide:
- Concise, actionable topic text (perfect for copy-paste)
- Strategic relevance context
- Relevance score (0-100) based on user context
- Clear rationale for why this topic matters

IMPORTANT: Return ONLY valid JSON with this structure:
{
  "suggestions": [
    {
      "id": "unique-id",
      "type": "decision",
      "title": "Strategic Decision Topic",
      "text": "Launch AI safety research initiative in Q2 2025",
      "context": "Based on recent discussions about AI governance and safety priorities in your organization",
      "relevanceScore": 85
    },
    {
      "id": "unique-id-2",
      "type": "forecast",
      "title": "Causal Analysis Topic",
      "text": "Anthropic becomes dominant AI safety leader by 2027",
      "context": "Aligned with organizational mission and recent strategic conversations",
      "relevanceScore": 78
    },
    {
      "id": "unique-id-3",
      "type": "scenario",
      "title": "Scenario Planning Topic",
      "text": "AI regulations become globally standardized by 2026",
      "context": "Critical uncertainty affecting organizational strategy and market positioning",
      "relevanceScore": 82
    }
  ],
  "userContext": {
    "recentTopics": ["AI safety research", "Strategic planning", "Market analysis"],
    "interests": ["Technology strategy", "Risk management", "Innovation planning"],
    "slackActivity": ["#strategy discussions", "#ai-safety conversations", "#executive-decisions"]
  },
  "analysisRationale": "Topics generated based on recent organizational activity, user engagement patterns, and strategic priorities identified in Slack conversations and documents."
}

Focus on high-impact strategic topics that would benefit from rigorous analysis. Consider current technology trends, business challenges, and organizational priorities. Make suggestions specific, actionable, and immediately valuable for strategic planning.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw topic suggestion response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    const analysis = JSON.parse(jsonText)

    // Add unique IDs if missing
    if (analysis.suggestions) {
      analysis.suggestions.forEach((suggestion: any, index: number) => {
        if (!suggestion.id) {
          suggestion.id = uuidv4()
        }
      })
    }

    return analysis
  } catch (error) {
    console.error('JSON parsing failed for topic suggestions:', error)

    // Fallback suggestions
    return {
      suggestions: [
        {
          id: uuidv4(),
          type: 'decision',
          title: 'Strategic Technology Investment',
          text: 'Invest $50M in next-generation AI research infrastructure',
          context: 'Technology investment decision with significant strategic implications',
          relevanceScore: 75
        },
        {
          id: uuidv4(),
          type: 'forecast',
          title: 'Market Leadership Analysis',
          text: 'Company becomes industry leader in AI safety by 2026',
          context: 'Strategic positioning and market leadership analysis',
          relevanceScore: 80
        },
        {
          id: uuidv4(),
          type: 'scenario',
          title: 'Regulatory Impact Planning',
          text: 'Comprehensive AI regulations implemented globally by 2025',
          context: 'Critical regulatory scenario for strategic planning',
          relevanceScore: 85
        }
      ],
      userContext: {
        recentTopics: ['Strategic planning', 'Technology decisions', 'Risk assessment'],
        interests: ['AI strategy', 'Business development', 'Market analysis'],
        slackActivity: ['General strategic discussions']
      },
      analysisRationale: 'General strategic topics relevant to executive decision-making and technology leadership.'
    }
  }
}