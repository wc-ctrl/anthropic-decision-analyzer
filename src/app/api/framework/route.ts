import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { frameworkId, frameworkName, fields, input, webContext } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const result = await populateFramework(frameworkId, frameworkName, fields, input, webContext)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Framework population error:', error)
    return NextResponse.json(
      { error: 'Failed to populate framework' },
      { status: 500 }
    )
  }
}

async function populateFramework(
  frameworkId: string,
  frameworkName: string,
  fields: Array<{ id: string; label: string }>,
  input: string,
  webContext?: any
) {
  const fieldDescriptions = fields.map(f => `- "${f.id}": ${f.label}`).join('\n')

  const fieldJsonShape = fields.reduce((acc, f) => {
    acc[f.id] = `[Detailed analysis for ${f.label}]`
    return acc
  }, {} as Record<string, string>)

  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 8000,
    messages: [{
      role: 'user',
      content: `You are an expert management consultant and strategic analyst. Your task is to apply the "${frameworkName}" framework to analyze the following case.

CASE/TOPIC: "${input}"

${webContext ? `
REAL-TIME WEB CONTEXT:
${webContext.contextualIntelligence?.substring(0, 800) || 'Web intelligence available'}
` : ''}

FRAMEWORK: ${frameworkName}
FIELDS TO POPULATE:
${fieldDescriptions}

INSTRUCTIONS:
1. Apply the ${frameworkName} framework rigorously to the given case
2. For each field, provide 3-5 detailed bullet points with specific, actionable insights
3. Use concrete examples and data points where possible
4. Ensure analysis is MECE (mutually exclusive, collectively exhaustive) across fields
5. Include a strategic recommendation or synthesis where appropriate

Return ONLY valid JSON with this exact structure:
${JSON.stringify({ fields: fieldJsonShape, recommendation: '[Overall strategic recommendation based on the framework analysis]' }, null, 2)}

Each field value should be a string with bullet points separated by newlines. Be specific, not generic. Tailor every insight to the given case.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw framework response:', responseText.substring(0, 200))

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    const parsed = JSON.parse(jsonText)
    return {
      frameworkId,
      frameworkName,
      caseDescription: input,
      fields: parsed.fields || parsed,
      recommendation: parsed.recommendation,
    }
  } catch (error) {
    console.error('JSON parsing failed for framework:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}
