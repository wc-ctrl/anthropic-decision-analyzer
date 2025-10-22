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
    const { type, input } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    let analysis
    if (type === 'decision') {
      analysis = await generateConsequences(input)
    } else if (type === 'forecast') {
      analysis = await generateCausalPathways(input)
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

async function generateConsequences(decision: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert business analyst helping executives analyze decisions.

Given this decision: "${decision}"

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

async function generateCausalPathways(forecast: string) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-latest',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert strategic analyst helping executives understand causal pathways.

Given this forecast/prediction: "${forecast}"

Generate a structured analysis of plausible causal pathways showing:
1. EXACTLY 5 first-order causes (direct drivers that could lead to this outcome)
2. For EACH of the 5 first-order causes, EXACTLY 2 underlying causes (root causes or enablers)

For each cause, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)

IMPORTANT: Return ONLY valid JSON with this EXACT structure - no other text:
{
  "firstOrder": [
    {"title": "First cause title", "description": "Brief description"},
    {"title": "Second cause title", "description": "Brief description"},
    {"title": "Third cause title", "description": "Brief description"},
    {"title": "Fourth cause title", "description": "Brief description"},
    {"title": "Fifth cause title", "description": "Brief description"}
  ],
  "secondOrder": {
    "0": [
      {"title": "First underlying cause", "description": "Brief description"},
      {"title": "Second underlying cause", "description": "Brief description"}
    ],
    "1": [
      {"title": "First underlying cause", "description": "Brief description"},
      {"title": "Second underlying cause", "description": "Brief description"}
    ],
    "2": [
      {"title": "First underlying cause", "description": "Brief description"},
      {"title": "Second underlying cause", "description": "Brief description"}
    ],
    "3": [
      {"title": "First underlying cause", "description": "Brief description"},
      {"title": "Second underlying cause", "description": "Brief description"}
    ],
    "4": [
      {"title": "First underlying cause", "description": "Brief description"},
      {"title": "Second underlying cause", "description": "Brief description"}
    ]
  }
}

Focus on realistic, interconnected causes that business leaders should monitor. Consider technological, economic, social, and regulatory drivers.`
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