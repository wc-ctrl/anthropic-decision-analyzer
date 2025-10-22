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
    const { analysis, triggeredBy, relatedNodes } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const commentary = await generateCommentary(analysis, triggeredBy, relatedNodes)
    return NextResponse.json(commentary)
  } catch (error) {
    console.error('Commentary error:', error)
    return NextResponse.json({
      id: uuidv4(),
      content: 'Commentary generation temporarily unavailable. The analysis continues to function normally.',
      timestamp: new Date(),
      triggeredBy: 'initialAnalysis',
      relatedNodes: []
    })
  }
}

async function generateCommentary(
  analysis: DecisionAnalysis,
  triggeredBy: Commentary['triggeredBy'],
  relatedNodes: string[]
): Promise<Commentary> {
  try {
    const nodeDescriptions = analysis.nodes
      .filter(n => relatedNodes.length === 0 || relatedNodes.includes(n.id))
      .map(n => `${n.data.label}: ${n.data.description || ''}`)
      .join('; ')

    const contextPrompt = analysis.mode.type === 'decision'
      ? `analyzing the consequences of the decision: "${analysis.mode.rootInput}"`
      : analysis.mode.type === 'forecast'
      ? `exploring causal pathways for the forecast: "${analysis.mode.rootInput}"`
      : `conducting scenario analysis for the target outcome: "${analysis.mode.rootInput}"`

    const actionContext = {
      'initialAnalysis': 'initial analysis was generated',
      'nodeEdit': 'a node was modified',
      'nodeAdd': 'a new node was added to the analysis',
      'nodeDelete': 'a node was removed from the analysis'
    }[triggeredBy]

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `You are a senior strategic advisor providing executive briefings on decision analysis. Your audience is C-level executives who need concise, actionable intelligence.

Context: You are ${contextPrompt}. The ${actionContext}.

Current system state:
- Nodes in analysis: ${nodeDescriptions}
- Analysis type: ${analysis.mode.type}

Provide an executive briefing with this EXACT structure:

**BOTTOM LINE UP FRONT (BLUF):** [One sentence summarizing the most critical insight]

**KEY IMPLICATIONS:**
• [Most important strategic implication]
• [Second most important implication]
• [Third key insight if relevant]

**STRATEGIC RISKS/OPPORTUNITIES:**
• [Primary risk or opportunity with brief rationale]
• [Secondary consideration]
• [Additional factor if significant]

**RECOMMENDED ACTIONS:**
• [Specific actionable recommendation]
• [Alternative consideration or mitigation]

Keep each bullet point to 1-2 concise sentences maximum. Focus on actionable intelligence that executives can immediately use for strategic decision-making. Be direct, evidence-based, and avoid unnecessary elaboration.`
      }]
    })

    const content = message.content[0].type === 'text' ? message.content[0].text : 'Analysis completed.'

    return {
      id: uuidv4(),
      content,
      timestamp: new Date(),
      triggeredBy,
      relatedNodes
    }

  } catch (error) {
    console.error('Error generating commentary:', error)
    return {
      id: uuidv4(),
      content: 'Commentary generation temporarily unavailable. The analysis continues to function normally.',
      timestamp: new Date(),
      triggeredBy,
      relatedNodes
    }
  }
}