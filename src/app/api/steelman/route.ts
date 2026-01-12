import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, input, contextualData } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    let analysis
    if (type === 'decision') {
      analysis = await generateDecisionSteelman(input, contextualData)
    } else if (type === 'forecast') {
      analysis = await generateForecastSteelman(input, contextualData)
    } else {
      // Default to decision steelman for other types
      analysis = await generateDecisionSteelman(input, contextualData)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Steelman analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate steelman analysis' },
      { status: 500 }
    )
  }
}

async function generateDecisionSteelman(decision: string, contextualData?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are a senior strategic advisor known for building the strongest possible case FOR a decision. Your role is to provide compelling, evidence-based arguments supporting this decision, using empirical data, facts, and probabilistic reasoning.

DECISION TO SUPPORT: "${decision}"

${contextualData ? `
ORGANIZATIONAL CONTEXT:
Slack Conversations: ${contextualData.slack ? contextualData.slack.map((msg: any) => `${msg.content}`).join('; ') : 'None'}
Google Drive Documents: ${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `${doc.excerpt}`).join('; ') : 'None'}
` : ''}

Generate a comprehensive steelman analysis that includes:

1. **Executive Summary**: Why this decision SHOULD be made
2. **Key Supporting Arguments**: 3-5 specific arguments FOR the decision
3. **Success Factors**: Conditions that increase likelihood of success
4. **Strategic Advantages**: Competitive and strategic benefits
5. **Conclusion**: Strong recommendation with rationale

For each argument, provide:
- Clear reasoning with empirical evidence where possible
- Probability estimates for positive outcomes (0-100%)
- Strength assessment (high/medium/low)
- Supporting data or precedents

Return ONLY valid JSON with this structure:
{
  "title": "Strategic Case For [Decision]",
  "summary": "Executive summary of why this decision should be pursued...",
  "arguments": [
    {
      "point": "Market timing is optimal",
      "evidence": "Historical data shows similar initiatives in this period achieve 85% higher success rates...",
      "probability": 85,
      "strength": "high"
    }
  ],
  "successFactors": [
    {
      "factor": "Strong market demand",
      "likelihood": 80,
      "impact": "Accelerated adoption and revenue growth"
    }
  ],
  "conclusion": "Based on empirical analysis, this decision offers significant upside...",
  "recommendedActions": [
    "Move forward with implementation",
    "Secure necessary resources",
    "Establish success metrics and monitoring"
  ]
}

Be thorough, evidence-based, and convincing. Build the strongest possible case while remaining intellectually honest.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw steelman response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for steelman:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}

async function generateForecastSteelman(forecast: string, contextualData?: any) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are an expert strategic analyst specializing in outcome enablement and success pathway analysis. Your task is to identify the most likely causal chains that would CAUSE this outcome to happen successfully.

TARGET OUTCOME TO ACHIEVE: "${forecast}"

${contextualData ? `
ORGANIZATIONAL CONTEXT:
Slack Conversations: ${contextualData.slack ? contextualData.slack.map((msg: any) => `${msg.content}`).join('; ') : 'None'}
Google Drive Documents: ${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `${doc.excerpt}`).join('; ') : 'None'}
` : ''}

Generate a comprehensive analysis of success pathways:

1. **Success Summary**: Why this outcome is likely to occur
2. **Enabling Factors**: 3-5 major factors that support the outcome
3. **Acceleration Scenarios**: Specific ways the outcome could be accelerated
4. **Probability Assessment**: Likelihood of success factors materializing
5. **Strategic Implications**: How to leverage these enablers

For each enabling factor, provide:
- Clear causal mechanism for success
- Probability estimate for this factor contributing to success (0-100%)
- Evidence or precedents supporting this pathway
- Strength of impact (high/medium/low)

Return ONLY valid JSON with this structure:
{
  "title": "Why [Outcome] Will Likely Succeed",
  "summary": "Analysis of most probable success pathways...",
  "arguments": [
    {
      "point": "Market conditions strongly favor success",
      "evidence": "Historical pattern shows 78% of similar initiatives succeed under these conditions...",
      "probability": 78,
      "strength": "high"
    }
  ],
  "successFactors": [
    {
      "factor": "Supportive regulatory environment",
      "likelihood": 75,
      "impact": "Accelerated timeline and reduced friction"
    }
  ],
  "conclusion": "Multiple convergent factors make this outcome highly achievable...",
  "recommendedActions": [
    "Capitalize on favorable market conditions",
    "Strengthen key success factors",
    "Build momentum with quick wins"
  ]
}

Focus on realistic, evidence-based success pathways. Use superforecasting methodology for probability estimates.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw forecast steelman response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for forecast steelman:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}
