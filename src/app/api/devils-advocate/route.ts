import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, input, contextualData, webContext } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    let analysis
    if (type === 'decision') {
      analysis = await generateDecisionDevilsAdvocate(input, contextualData, webContext)
    } else if (type === 'forecast') {
      analysis = await generateCausalDevilsAdvocate(input, contextualData, webContext)
    } else {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Devil\'s advocate analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate devil\'s advocate analysis' },
      { status: 500 }
    )
  }
}

async function generateDecisionDevilsAdvocate(decision: string, contextualData?: any, webContext?: any) {
  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 5000,
    messages: [{
      role: 'user',
      content: `You are a senior strategic advisor known for rigorous contrarian analysis. Your role is to provide the strongest possible case AGAINST making this decision, using empirical data, facts, and probabilistic reasoning.

DECISION TO CHALLENGE: "${decision}"

${contextualData ? `
ORGANIZATIONAL CONTEXT:
Slack Conversations: ${contextualData.slack ? contextualData.slack.map((msg: any) => `${msg.content}`).join('; ') : 'None'}
Google Drive Documents: ${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `${doc.excerpt}`).join('; ') : 'None'}
` : ''}

${webContext?.contextualIntelligence ? `
REAL-TIME WEB INTELLIGENCE:
${webContext.contextualIntelligence.substring(0, 1200)}

Use this real-time information to strengthen your contrarian arguments with current evidence.
` : ''}

Generate a comprehensive contrarian analysis that includes:

1. **Executive Summary**: Why this decision should NOT be made
2. **Key Counterarguments**: 3-5 specific arguments against the decision
3. **Risk Factors**: Quantified risks with probability estimates
4. **Strategic Alternatives**: Better courses of action
5. **Conclusion**: Final recommendation with rationale

For each argument, provide:
- Clear reasoning with empirical evidence where possible
- Probability estimates for negative outcomes (0-100%)
- Impact assessment (high/medium/low)
- Supporting data or precedents

Return ONLY valid JSON with this structure:
{
  "title": "Strategic Case Against [Decision]",
  "summary": "Executive summary of why this decision should be avoided...",
  "arguments": [
    {
      "point": "Market timing is problematic",
      "evidence": "Historical data shows similar launches in this period face 73% higher failure rates...",
      "probability": 73,
      "impact": "high"
    }
  ],
  "riskFactors": [
    {
      "factor": "Competitive response risk",
      "likelihood": 85,
      "severity": "Market share erosion of 15-25%"
    }
  ],
  "conclusion": "Based on empirical analysis, this decision poses significant risks...",
  "recommendedActions": [
    "Delay decision until market conditions stabilize",
    "Conduct additional market research",
    "Consider phased approach instead"
  ]
}

Be thorough, evidence-based, and probabilistically rigorous. Challenge assumptions and highlight overlooked risks.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw devils advocate response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for devil\'s advocate:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}

async function generateCausalDevilsAdvocate(forecast: string, contextualData?: any, webContext?: any) {
  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 5000,
    messages: [{
      role: 'user',
      content: `You are an expert strategic analyst specializing in failure mode analysis and outcome prevention. Your task is to identify the most likely causal chains that would PREVENT this outcome from happening.

TARGET OUTCOME TO PREVENT: "${forecast}"

${contextualData ? `
ORGANIZATIONAL CONTEXT:
Slack Conversations: ${contextualData.slack ? contextualData.slack.map((msg: any) => `${msg.content}`).join('; ') : 'None'}
Google Drive Documents: ${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `${doc.excerpt}`).join('; ') : 'None'}
` : ''}

${webContext?.contextualIntelligence ? `
REAL-TIME WEB INTELLIGENCE:
${webContext.contextualIntelligence.substring(0, 1200)}

Use this real-time information to identify prevention pathways grounded in current evidence.
` : ''}

Generate a comprehensive analysis of prevention pathways:

1. **Prevention Summary**: Why this outcome likely won't occur
2. **Blocking Factors**: 3-5 major factors that could prevent the outcome
3. **Disruption Scenarios**: Specific ways the outcome could be derailed
4. **Probability Assessment**: Likelihood of prevention factors occurring
5. **Strategic Implications**: What these prevention pathways mean

For each blocking factor, provide:
- Clear causal mechanism for prevention
- Probability estimate for this factor preventing the outcome (0-100%)
- Evidence or precedents supporting this pathway
- Impact severity if this prevention occurs

Return ONLY valid JSON with this structure:
{
  "title": "Why [Outcome] Likely Won't Happen",
  "summary": "Analysis of most probable prevention pathways...",
  "arguments": [
    {
      "point": "Regulatory intervention will block progress",
      "evidence": "Historical pattern shows 68% of similar initiatives face regulatory delays...",
      "probability": 68,
      "impact": "high"
    }
  ],
  "riskFactors": [
    {
      "factor": "Market disruption by competitors",
      "likelihood": 75,
      "severity": "Complete prevention of outcome achievement"
    }
  ],
  "conclusion": "Multiple convergent factors make this outcome unlikely...",
  "recommendedActions": [
    "Monitor regulatory environment closely",
    "Develop contingency plans for prevention scenarios",
    "Build resilience against disruption factors"
  ]
}

Focus on realistic, evidence-based prevention pathways. Use superforecasting methodology for probability estimates.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw causal devils advocate response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for causal devil\'s advocate:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}