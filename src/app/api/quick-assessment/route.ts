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
    const { nodes, analysisType, decision } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const assessment = await generateQuickAssessment(nodes, analysisType, decision)
    return NextResponse.json(assessment)

  } catch (error) {
    console.error('Quick assessment error:', error)
    return NextResponse.json(
      { error: 'Failed to generate quick assessment' },
      { status: 500 }
    )
  }
}

async function generateQuickAssessment(nodes: DecisionNode[], analysisType: string, decision: string) {
  // Calculate sentiment distribution
  const analysisNodes = nodes.filter(n => n.data.order > 0)
  const sentimentCounts = {
    positive: analysisNodes.filter(n => n.data.sentiment === 'positive').length,
    negative: analysisNodes.filter(n => n.data.sentiment === 'negative').length,
    neutral: analysisNodes.filter(n => n.data.sentiment === 'neutral').length
  }

  // Prepare node summary for AI analysis
  const nodeSummary = analysisNodes.map(node =>
    `${node.data.label} (${node.data.sentiment || 'neutral'}) - ${node.data.description || ''}`
  ).join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: `You are a senior strategic advisor providing rapid executive assessments. Your role is to give a clear, opinionated verdict on whether this decision should be pursued.

DECISION: "${decision}"
ANALYSIS TYPE: ${analysisType}

CONSEQUENCES/FACTORS ANALYZED:
${nodeSummary}

SENTIMENT DISTRIBUTION:
- Positive factors: ${sentimentCounts.positive}
- Negative factors: ${sentimentCounts.negative}
- Neutral factors: ${sentimentCounts.neutral}

TASK: Provide a rapid net benefit analysis with clear executive verdict.

Consider:
1. Overall risk-reward balance based on sentiment distribution
2. Critical positive and negative factors identified
3. Strategic timing and implementation feasibility
4. Potential for mitigation of negative factors
5. Magnitude and likelihood of positive outcomes

Provide an opinionated, confident assessment suitable for C-level decision-making.

Return ONLY valid JSON with this structure:
{
  "verdict": "proceed" | "caution" | "avoid",
  "confidence": 85,
  "netBenefit": 6.5,
  "bottomLine": "One-sentence executive recommendation with clear rationale",
  "summary": "2-3 sentence strategic assessment explaining the net benefit analysis and key considerations",
  "keyFactors": {
    "positive": ["Most compelling benefit", "Second strongest advantage"],
    "negative": ["Greatest risk", "Major concern"],
    "neutral": ["Key consideration", "Important factor"]
  }
}

Where:
- verdict: Clear recommendation (proceed/caution/avoid)
- confidence: How certain you are (0-100%)
- netBenefit: Score from -10 (terrible) to +10 (excellent)
- bottomLine: One sentence bottom-line-up-front recommendation
- summary: Brief strategic rationale for the verdict
- keyFactors: Top 2 factors in each category that drive the assessment

Be decisive and opinionated. Executives need clear guidance, not equivocation.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw quick assessment response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for quick assessment:', error)

    // Fallback assessment based on sentiment distribution
    const totalNodes = sentimentCounts.positive + sentimentCounts.negative + sentimentCounts.neutral
    const positiveRatio = sentimentCounts.positive / totalNodes
    const negativeRatio = sentimentCounts.negative / totalNodes

    let verdict: 'proceed' | 'caution' | 'avoid'
    let netBenefit: number
    let bottomLine: string

    if (positiveRatio > 0.6) {
      verdict = 'proceed'
      netBenefit = 7
      bottomLine = 'Strong positive factors outweigh risks - recommend proceeding with implementation.'
    } else if (negativeRatio > 0.6) {
      verdict = 'avoid'
      netBenefit = -6
      bottomLine = 'Significant negative factors present substantial risks - recommend avoiding this decision.'
    } else {
      verdict = 'caution'
      netBenefit = 2
      bottomLine = 'Mixed implications require careful planning - proceed with caution and mitigation strategies.'
    }

    return {
      verdict,
      confidence: 75,
      netBenefit,
      bottomLine,
      summary: `Based on analysis of ${totalNodes} factors (${sentimentCounts.positive} positive, ${sentimentCounts.negative} negative), the decision shows ${verdict === 'proceed' ? 'favorable' : verdict === 'avoid' ? 'unfavorable' : 'mixed'} strategic implications.`,
      keyFactors: {
        positive: ['Positive factors identified', 'Strategic opportunities present'],
        negative: ['Risk factors require attention', 'Implementation challenges noted'],
        neutral: ['Balanced considerations', 'Context-dependent factors']
      }
    }
  }
}