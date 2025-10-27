import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionNode } from '@/types/decision'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentNodes, targetOrder } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const newLayer = await generateNextLayer(parentNodes, targetOrder)
    return NextResponse.json(newLayer)
  } catch (error) {
    console.error('Layer generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate next layer' },
      { status: 500 }
    )
  }
}

async function generateNextLayer(parentNodes: DecisionNode[], targetOrder: number) {
  // Create context from parent nodes
  const parentContext = parentNodes.map(node =>
    `"${node.data.label}": ${node.data.description || 'No description'}`
  ).join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are an expert business analyst generating deeper consequence analysis.

Given these ${targetOrder - 1}${getOrdinalSuffix(targetOrder - 1)} order consequences:
${parentContext}

For EACH of the above consequences, generate EXACTLY 1 ${targetOrder}${getOrdinalSuffix(targetOrder)} order consequence (deeper consequence of each).

For each new consequence, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)

IMPORTANT: Return ONLY valid JSON with this structure - no other text:
{
  "consequences": [
    {
      "parentId": "parent-node-id-from-input",
      "title": "Consequence title",
      "description": "Brief description"
    }
  ]
}

Focus on realistic, deeper implications that follow logically from each parent consequence. Consider long-term strategic, operational, and systemic effects.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw Claude layer response:', responseText)

  // Extract JSON from response if it's wrapped in other text
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  let analysis
  try {
    analysis = JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for layer generation:', error)
    console.error('Response text:', responseText)
    throw new Error('Invalid JSON response from Claude')
  }

  return analysis
}

function getOrdinalSuffix(num: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd', 'th', 'th', 'th']
  return num > 3 ? 'th' : suffixes[num] || 'th'
}