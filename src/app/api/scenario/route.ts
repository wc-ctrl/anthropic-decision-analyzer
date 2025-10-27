import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, contextualData } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const analysis = await generateScenarioAnalysis(input, contextualData)
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Scenario analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate scenario analysis' },
      { status: 500 }
    )
  }
}

async function generateScenarioAnalysis(outcome: string, contextualData?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 3000,
    messages: [{
      role: 'user',
      content: `You are an expert strategic forecaster specializing in scenario planning and signpost methodology. You understand probabilistic reasoning, superforecasting techniques, and strategic intelligence analysis.

TARGET OUTCOME: "${outcome}"

${contextualData ? `
ORGANIZATIONAL CONTEXT:
Slack Conversations: ${contextualData.slack ? contextualData.slack.map((msg: any) => `${msg.content}`).join('; ') : 'None'}
Google Drive Documents: ${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `${doc.excerpt}`).join('; ') : 'None'}
` : ''}

Generate a comprehensive scenario analysis with 6 distinct probability tracks, each with 5 tiers of signposts that would indicate we're on that particular track.

For each probability track (100%, 80%, 60%, 40%, 20%, 0%), provide:
1. Track description explaining what this probability scenario looks like
2. 5 signposts/indicators arranged in chronological tiers (early to late signals)
3. Each signpost should include: specific observable event, timeframe, confidence level

IMPORTANT: Return ONLY valid JSON with this EXACT structure:
{
  "targetOutcome": "${outcome}",
  "methodology": "Probability-based scenario planning with signpost methodology, incorporating base rates, reference class forecasting, and evidence-based projections.",
  "keyUncertainties": [
    "Critical uncertainty factor 1",
    "Critical uncertainty factor 2",
    "Critical uncertainty factor 3"
  ],
  "tracks": [
    {
      "probability": 100,
      "label": "Maximally Likely",
      "description": "Scenario where all conditions align perfectly for the outcome",
      "signposts": [
        {
          "id": "tier1-100-1",
          "text": "Early indicator we would observe",
          "timeframe": "Q1 2025",
          "confidence": 90,
          "tier": 1
        },
        {
          "id": "tier2-100-1",
          "text": "Mid-stage indicator",
          "timeframe": "Q3 2025",
          "confidence": 85,
          "tier": 2
        },
        {
          "id": "tier3-100-1",
          "text": "Advanced indicator",
          "timeframe": "Q1 2026",
          "confidence": 80,
          "tier": 3
        },
        {
          "id": "tier4-100-1",
          "text": "Late-stage signal",
          "timeframe": "Q3 2026",
          "confidence": 75,
          "tier": 4
        },
        {
          "id": "tier5-100-1",
          "text": "Final confirmation signal",
          "timeframe": "Q4 2026",
          "confidence": 95,
          "tier": 5
        }
      ]
    },
    {
      "probability": 80,
      "label": "Very Likely",
      "description": "Scenario with strong fundamentals but some challenges",
      "signposts": [
        {
          "id": "tier1-80-1",
          "text": "Early indicator for 80% scenario",
          "timeframe": "Q1 2025",
          "confidence": 85,
          "tier": 1
        },
        {
          "id": "tier2-80-1",
          "text": "Mid-stage indicator",
          "timeframe": "Q3 2025",
          "confidence": 80,
          "tier": 2
        },
        {
          "id": "tier3-80-1",
          "text": "Advanced indicator",
          "timeframe": "Q1 2026",
          "confidence": 75,
          "tier": 3
        },
        {
          "id": "tier4-80-1",
          "text": "Late-stage signal",
          "timeframe": "Q3 2026",
          "confidence": 70,
          "tier": 4
        },
        {
          "id": "tier5-80-1",
          "text": "Final confirmation signal",
          "timeframe": "Q4 2026",
          "confidence": 80,
          "tier": 5
        }
      ]
    },
    {
      "probability": 60,
      "label": "Somewhat Likely",
      "description": "Moderate scenario with mixed signals and uncertainty",
      "signposts": [
        {
          "id": "tier1-60-1",
          "text": "Early indicator for 60% scenario",
          "timeframe": "Q2 2025",
          "confidence": 70,
          "tier": 1
        },
        {
          "id": "tier2-60-1",
          "text": "Mid-stage indicator",
          "timeframe": "Q4 2025",
          "confidence": 65,
          "tier": 2
        },
        {
          "id": "tier3-60-1",
          "text": "Advanced indicator",
          "timeframe": "Q2 2026",
          "confidence": 60,
          "tier": 3
        },
        {
          "id": "tier4-60-1",
          "text": "Late-stage signal",
          "timeframe": "Q4 2026",
          "confidence": 55,
          "tier": 4
        },
        {
          "id": "tier5-60-1",
          "text": "Final confirmation signal",
          "timeframe": "Q1 2027",
          "confidence": 60,
          "tier": 5
        }
      ]
    },
    {
      "probability": 40,
      "label": "Somewhat Unlikely",
      "description": "Challenging scenario with significant headwinds",
      "signposts": [
        {
          "id": "tier1-40-1",
          "text": "Early warning indicator",
          "timeframe": "Q2 2025",
          "confidence": 60,
          "tier": 1
        },
        {
          "id": "tier2-40-1",
          "text": "Mid-stage obstacle",
          "timeframe": "Q4 2025",
          "confidence": 55,
          "tier": 2
        },
        {
          "id": "tier3-40-1",
          "text": "Major challenge indicator",
          "timeframe": "Q2 2026",
          "confidence": 50,
          "tier": 3
        },
        {
          "id": "tier4-40-1",
          "text": "Late resistance signal",
          "timeframe": "Q4 2026",
          "confidence": 45,
          "tier": 4
        },
        {
          "id": "tier5-40-1",
          "text": "Final outcome indicator",
          "timeframe": "Q1 2027",
          "confidence": 40,
          "tier": 5
        }
      ]
    },
    {
      "probability": 20,
      "label": "Very Unlikely",
      "description": "Low-probability scenario with major structural barriers",
      "signposts": [
        {
          "id": "tier1-20-1",
          "text": "Early barrier indicator",
          "timeframe": "Q1 2025",
          "confidence": 50,
          "tier": 1
        },
        {
          "id": "tier2-20-1",
          "text": "Structural obstacle",
          "timeframe": "Q3 2025",
          "confidence": 45,
          "tier": 2
        },
        {
          "id": "tier3-20-1",
          "text": "Major impediment",
          "timeframe": "Q1 2026",
          "confidence": 40,
          "tier": 3
        },
        {
          "id": "tier4-20-1",
          "text": "Critical failure point",
          "timeframe": "Q3 2026",
          "confidence": 35,
          "tier": 4
        },
        {
          "id": "tier5-20-1",
          "text": "Outcome prevention confirmed",
          "timeframe": "Q4 2026",
          "confidence": 20,
          "tier": 5
        }
      ]
    },
    {
      "probability": 0,
      "label": "Maximally Unlikely",
      "description": "Scenario where fundamental conditions make outcome impossible",
      "signposts": [
        {
          "id": "tier1-0-1",
          "text": "Fundamental barrier emerges",
          "timeframe": "Q1 2025",
          "confidence": 40,
          "tier": 1
        },
        {
          "id": "tier2-0-1",
          "text": "Systemic opposition develops",
          "timeframe": "Q2 2025",
          "confidence": 35,
          "tier": 2
        },
        {
          "id": "tier3-0-1",
          "text": "Insurmountable obstacles confirmed",
          "timeframe": "Q4 2025",
          "confidence": 30,
          "tier": 3
        },
        {
          "id": "tier4-0-1",
          "text": "Alternative outcomes dominate",
          "timeframe": "Q2 2026",
          "confidence": 25,
          "tier": 4
        },
        {
          "id": "tier5-0-1",
          "text": "Outcome definitively prevented",
          "timeframe": "Q4 2026",
          "confidence": 0,
          "tier": 5
        }
      ]
    }
  ]
}

Focus on realistic, observable indicators that strategic planners can monitor. Use specific, measurable signposts with realistic timeframes and confidence levels.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw scenario analysis response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for scenario analysis:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}