import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionAnalysis, Commentary } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, input, useSlack = true, useGDrive = true } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Get contextual data from MCP sources if available
    let contextualData = null
    const sources = []
    if (useSlack) sources.push('slack')
    if (useGDrive) sources.push('gdrive')

    if (sources.length > 0) {
      try {
        const contextResponse = await fetch(`${request.url.split('/api')[0]}/api/mcp/get-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input, sources })
        })

        if (contextResponse.ok) {
          const contextResult = await contextResponse.json()
          contextualData = contextResult.context
        }
      } catch (contextError) {
        console.log('Context retrieval failed, proceeding without MCP data:', contextError)
      }
    }

    let analysis
    if (type === 'decision') {
      analysis = await generateConsequences(input, contextualData)
    } else if (type === 'forecast') {
      analysis = await generateCausalPathways(input, contextualData)
    } else {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}

async function generateConsequences(decision: string, contextualData?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert business analyst helping executives analyze decisions.

Given this decision: "${decision}"

${contextualData ? `
ADDITIONAL CONTEXT from organizational sources:

Slack Conversations:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- ${msg.channel}: ${msg.content}`).join('\n') : 'No Slack data available'}

Google Drive Documents:
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- ${doc.fileName}: ${doc.excerpt}`).join('\n') : 'No Google Drive data available'}

Use this context to inform your analysis, but focus primarily on strategic business implications.
` : ''}

Generate a structured analysis with:
1. EXACTLY 5 first-order consequences (direct results)
2. For EACH of the 5 first-order consequences, EXACTLY 2 second-order consequences (consequences of consequences)

For each consequence, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)

IMPORTANT: Return ONLY valid JSON with this EXACT structure - no other text:
{
  "firstOrder": [
    {"title": "First consequence title", "description": "Brief description"},
    {"title": "Second consequence title", "description": "Brief description"},
    {"title": "Third consequence title", "description": "Brief description"},
    {"title": "Fourth consequence title", "description": "Brief description"},
    {"title": "Fifth consequence title", "description": "Brief description"}
  ],
  "secondOrder": {
    "0": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "1": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "2": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "3": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "4": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ]
  }
}

Focus on realistic, business-relevant consequences that executives would care about. Consider financial, operational, strategic, and human impacts.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw Claude response:', responseText)

  // Extract JSON from response if it's wrapped in other text
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  let analysis
  try {
    analysis = JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed:', error)
    console.error('Response text:', responseText)
    throw new Error('Invalid JSON response from Claude')
  }

  return {
    type: 'decision',
    analysis,
    input: decision
  }
}

async function generateCausalPathways(forecast: string, contextualData?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert superforecaster trained in the methodology of Philip Tetlock and the Good Judgment Project. You understand base rates, reference class forecasting, and probabilistic reasoning.

Given this outcome/forecast: "${forecast}"

${contextualData ? `
ADDITIONAL CONTEXT from organizational sources:

Slack Conversations:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- ${msg.channel}: ${msg.content}`).join('\n') : 'No Slack data available'}

Google Drive Documents:
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- ${doc.fileName}: ${doc.excerpt}`).join('\n') : 'No Google Drive data available'}

Use this context to ground your probability estimates in real organizational data and strategic discussions.
` : ''}

Generate a causal analysis showing what led to this outcome:
1. EXACTLY 5 first-order causes (direct drivers that led to this outcome)
2. For EACH first-order cause, EXACTLY 2 second-order causes (underlying factors)

For each cause, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)
- A probability estimate (0-100) representing how likely this factor was to contribute significantly to the outcome

Use superforecasting principles:
- Consider base rates and historical precedents
- Account for regression to the mean
- Avoid overconfidence bias
- Use reference class forecasting
- Consider both inside and outside view perspectives

IMPORTANT: Return ONLY valid JSON with this EXACT structure:
{
  "firstOrder": [
    {"title": "Primary causal factor", "description": "Description", "probability": 85},
    {"title": "Secondary causal factor", "description": "Description", "probability": 72},
    {"title": "Third causal factor", "description": "Description", "probability": 68},
    {"title": "Fourth causal factor", "description": "Description", "probability": 60},
    {"title": "Fifth causal factor", "description": "Description", "probability": 55}
  ],
  "secondOrder": {
    "0": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 78},
      {"title": "Underlying factor 2", "description": "Description", "probability": 65}
    ],
    "1": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 70},
      {"title": "Underlying factor 2", "description": "Description", "probability": 62}
    ],
    "2": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 66},
      {"title": "Underlying factor 2", "description": "Description", "probability": 58}
    ],
    "3": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 64},
      {"title": "Underlying factor 2", "description": "Description", "probability": 54}
    ],
    "4": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 61},
      {"title": "Underlying factor 2", "description": "Description", "probability": 52}
    ]
  }
}

Focus on realistic, evidence-based causal factors. Consider market dynamics, technological trends, regulatory changes, and competitive forces.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw Claude forecast response:', responseText)

  // Extract JSON from response if it's wrapped in other text
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  let analysis
  try {
    analysis = JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for forecast:', error)
    console.error('Response text:', responseText)
    throw new Error('Invalid JSON response from Claude')
  }

  return {
    type: 'forecast',
    analysis,
    input: forecast
  }
}