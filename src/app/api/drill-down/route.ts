import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionNode, DecisionEdge } from '@/types/decision'
import { generateOptimizedTreeLayout } from '@/utils/layoutUtils'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { focusNode, parentAnalysisType, isExpertMode, contextualData } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const subAnalysis = await generateFocusedSubAnalysis(
      focusNode,
      parentAnalysisType,
      isExpertMode,
      contextualData
    )

    return NextResponse.json(subAnalysis)

  } catch (error) {
    console.error('Drill-down analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate drill-down analysis' },
      { status: 500 }
    )
  }
}

async function generateFocusedSubAnalysis(
  focusNode: DecisionNode,
  parentAnalysisType: string,
  isExpertMode: boolean,
  contextualData?: any
) {
  const analysisStructure = isExpertMode ? '5→2' : '3→1'
  const nodeCount = isExpertMode ? { first: 5, second: 2 } : { first: 3, second: 1 }

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are an expert strategic analyst specializing in focused deep-dive analysis.

DRILL-DOWN TARGET: "${focusNode.data.label}"
Description: ${focusNode.data.description || 'No description provided'}
Node Order: ${focusNode.data.order} (from parent ${parentAnalysisType} analysis)
Analysis Complexity: ${isExpertMode ? 'Expert' : 'Easy'} Mode

${contextualData ? `
ORGANIZATIONAL CONTEXT:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- Slack: ${msg.content}`).join('\n') : ''}
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- Doc: ${doc.excerpt}`).join('\n') : ''}
` : ''}

TASK: Create a focused deep-dive analysis specifically for this node.

${parentAnalysisType === 'decision' ? `
Treating "${focusNode.data.label}" as a decision point, generate:
1. EXACTLY ${nodeCount.first} first-order consequences of implementing this specific aspect
2. For EACH first-order consequence, EXACTLY ${nodeCount.second} second-order consequence(s)

Focus on the specific implications, implementation challenges, and downstream effects
of this particular consequence within the broader strategic context.
` : parentAnalysisType === 'forecast' ? `
Treating "${focusNode.data.label}" as an outcome to understand, generate:
1. EXACTLY ${nodeCount.first} first-order causes that specifically led to this factor
2. For EACH first-order cause, EXACTLY ${nodeCount.second} second-order cause(s)
3. Include probability estimates for each causal factor

Focus on the specific drivers, preconditions, and enabling factors
that would make this particular outcome materialize.
` : parentAnalysisType === 'scenario' ? `
Treating "${focusNode.data.label}" as a scenario element, generate:
1. EXACTLY ${nodeCount.first} first-order implications and sub-elements
2. For EACH first-order element, EXACTLY ${nodeCount.second} second-order detail(s)

Focus on specific aspects, variations, and detailed exploration of this scenario element.
` : `
Treating "${focusNode.data.label}" as a strategic element, generate:
1. EXACTLY ${nodeCount.first} first-order considerations and sub-strategies
2. For EACH first-order element, EXACTLY ${nodeCount.second} second-order tactical detail(s)

Focus on implementation specifics, stakeholder considerations, and tactical execution of this strategic element.
`}

Generate a ${analysisStructure} structure with detailed analysis of this specific node's
implications, treating it as the central focus of a dedicated analysis.

Return ONLY valid JSON with this structure:
{
  "nodes": [
    {
      "id": "sub-root",
      "type": "interactive",
      "data": {
        "label": "${focusNode.data.label}",
        "description": "Root of drill-down analysis",
        "order": 0,
        "nodeType": "${parentAnalysisType === 'decision' ? 'consequence' : 'forecast'}",
        "probability": ${focusNode.data.probability || 'null'}
      },
      "position": {"x": 400, "y": 50}
    }
    // Add first and second order nodes following the ${analysisStructure} pattern
  ],
  "edges": [
    // Appropriate edges connecting the sub-analysis tree
  ]
}

Create a comprehensive focused analysis that provides deep insights into this specific
strategic element while maintaining the ${analysisStructure} structure.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw drill-down response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    const analysis = JSON.parse(jsonText)

    // Apply layout to the sub-analysis
    if (analysis.nodes) {
      const layoutNodes = generateOptimizedTreeLayout(analysis.nodes, parentAnalysisType === 'forecast')
      analysis.nodes = layoutNodes
    }

    return analysis

  } catch (error) {
    console.error('JSON parsing failed for drill-down analysis:', error)

    // Fallback minimal structure
    const fallbackRoot: DecisionNode = {
      id: 'sub-root',
      type: 'interactive',
      data: {
        label: focusNode.data.label,
        description: 'Drill-down analysis root',
        order: 0,
        nodeType: focusNode.data.nodeType,
        probability: focusNode.data.probability
      },
      position: { x: 400, y: 50 }
    }

    return {
      nodes: [fallbackRoot],
      edges: []
    }
  }
}