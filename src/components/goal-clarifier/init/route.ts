import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { v4 as uuidv4 } from 'uuid'

const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { rawInput } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    if (!rawInput?.trim()) {
      return NextResponse.json(
        { error: 'Raw input is required' },
        { status: 400 }
      )
    }

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are an expert goal-setting coach who helps people transform vague goals into clear, actionable objectives.

Analyze this raw goal statement: "${rawInput}"

Your task:
1. Provide your interpretation of what the user is trying to achieve
2. Identify gaps in the goal using SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
3. Generate clarifying questions that would help refine the goal

For each gap, categorize it as:
- specificity: The goal is too vague or broad
- measurability: No clear way to measure success
- achievability: Unclear if resources/capabilities exist
- relevance: Connection to larger purpose unclear
- timebound: No deadline or timeline specified

And rate severity as: minor, moderate, or major

Return ONLY valid JSON with this structure:
{
  "initialAnalysis": {
    "interpretation": "Your understanding of what they want to achieve (2-3 sentences)",
    "gaps": [
      {
        "id": "gap1",
        "category": "specificity",
        "description": "Description of the gap",
        "severity": "moderate",
        "suggestedQuestion": "Question to address this gap"
      }
    ],
    "clarifyingQuestions": [
      "Question 1 to help refine the goal",
      "Question 2 to help refine the goal",
      "Question 3 to help refine the goal"
    ]
  }
}

Be constructive and helpful, not critical. Focus on helping them clarify, not pointing out failures.`
      }]
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

    let jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const jsonText = jsonMatch ? jsonMatch[0] : responseText

    let result
    try {
      result = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError)
      // Return a fallback response
      result = {
        initialAnalysis: {
          interpretation: `You want to ${rawInput.toLowerCase()}. Let's work together to make this goal more specific and actionable.`,
          gaps: [
            {
              id: uuidv4(),
              category: 'specificity',
              description: 'The goal could benefit from more specific details about the desired outcome',
              severity: 'moderate',
              suggestedQuestion: 'What does success look like specifically?'
            }
          ],
          clarifyingQuestions: [
            'What specific outcome are you hoping to achieve?',
            'By when do you want to accomplish this?',
            'What resources do you have available?'
          ]
        }
      }
    }

    // Add IDs to gaps if missing
    if (result.initialAnalysis?.gaps) {
      result.initialAnalysis.gaps = result.initialAnalysis.gaps.map((gap: any) => ({
        ...gap,
        id: gap.id || uuidv4()
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Goal clarifier init error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze goal' },
      { status: 500 }
    )
  }
}
