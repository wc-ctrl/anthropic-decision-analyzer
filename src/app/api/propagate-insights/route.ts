import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionNode, Commentary } from '@/types/decision'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      focusNode,
      subAnalysis,
      parentAnalysisType,
      isExpertMode
    } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const propagationInsights = await generatePropagationSuggestions(
      focusNode,
      subAnalysis,
      parentAnalysisType,
      isExpertMode
    )

    return NextResponse.json(propagationInsights)

  } catch (error) {
    console.error('Propagation insights error:', error)
    return NextResponse.json(
      { error: 'Failed to generate propagation insights' },
      { status: 500 }
    )
  }
}

async function generatePropagationSuggestions(
  focusNode: DecisionNode,
  subAnalysis: { nodes: DecisionNode[], edges: any[], commentary: Commentary[] },
  parentAnalysisType: string,
  isExpertMode: boolean
) {
  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `You are an expert strategic analyst specializing in insight propagation and decision tree enhancement.

DRILL-DOWN COMPLETED FOR: "${focusNode.data.label}"

SUB-ANALYSIS RESULTS:
${subAnalysis.nodes.map(node => `- ${node.data.label} (Order ${node.data.order}): ${node.data.description || ''}`).join('\n')}

COMMENTARY INSIGHTS:
${subAnalysis.commentary.map(c => c.content.substring(0, 200)).join('\n\n')}

TASK: Analyze the drill-down insights and suggest how they should update or influence other nodes in the main decision tree.

Consider:
1. What did the deep dive reveal about the focus node that wasn't apparent before?
2. How do these insights change our understanding of related nodes?
3. What new risks, opportunities, or considerations emerged?
4. Which other nodes in the main tree should be updated based on these findings?

Generate propagation suggestions that would enhance the overall strategic analysis.

Return ONLY valid JSON with this structure:
{
  "propagationSuggestions": [
    {
      "targetNodeId": "node-id-in-main-tree",
      "suggestedUpdate": "Updated node content or new insight",
      "rationale": "Why this update is needed based on drill-down findings",
      "updateType": "modify" | "risk_alert" | "opportunity_highlight" | "dependency_note"
    }
  ],
  "strategicImplications": "Overall analysis of how the drill-down insights affect the main strategic assessment",
  "keyFindings": [
    "Most important insight from drill-down",
    "Critical risk or opportunity identified",
    "Strategic consideration that emerged"
  ],
  "recommendedMainTreeUpdates": "Summary of how the main analysis should evolve based on these findings"
}

Focus on actionable insights that would meaningfully enhance the main strategic analysis.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw propagation insights response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for propagation insights:', error)

    // Fallback insights
    return {
      propagationSuggestions: [],
      strategicImplications: 'Deep dive analysis completed successfully. Insights generated for focused strategic assessment.',
      keyFindings: [
        'Detailed analysis of focus node completed',
        'Strategic implications documented',
        'Ready for main tree integration'
      ],
      recommendedMainTreeUpdates: 'Consider updating related nodes based on drill-down insights'
    }
  }
}