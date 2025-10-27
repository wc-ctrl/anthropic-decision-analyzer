import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionNode, DecisionEdge } from '@/types/decision'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      action, // 'edit', 'delete', 'add'
      targetNode,
      allNodes,
      allEdges,
      analysisType,
      isExpertMode,
      contextualData
    } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    let updateResult
    switch (action) {
      case 'edit':
        updateResult = await handleNodeEdit(targetNode, allNodes, allEdges, analysisType, isExpertMode, contextualData)
        break
      case 'delete':
        updateResult = await handleNodeDelete(targetNode, allNodes, allEdges, analysisType, isExpertMode, contextualData)
        break
      case 'add':
        updateResult = await handleNodeAdd(targetNode, allNodes, allEdges, analysisType, isExpertMode, contextualData)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        )
    }

    return NextResponse.json(updateResult)

  } catch (error) {
    console.error('Graph update error:', error)
    return NextResponse.json(
      { error: 'Failed to update graph intelligently' },
      { status: 500 }
    )
  }
}

async function handleNodeEdit(
  targetNode: DecisionNode,
  allNodes: DecisionNode[],
  allEdges: DecisionEdge[],
  analysisType: string,
  isExpertMode: boolean,
  contextualData?: any
) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are an expert decision analyst specializing in dynamic graph updating and logical consistency.

CONTEXT:
Analysis Type: ${analysisType}
Mode: ${isExpertMode ? 'Expert' : 'Easy'}
Target Node Edited: "${targetNode.data.label}" (Order ${targetNode.data.order})
Description: ${targetNode.data.description || 'No description'}

CURRENT GRAPH STATE:
${allNodes.map(node => `- ${node.data.label} (Order ${node.data.order}): ${node.data.description || 'No description'}`).join('\n')}

${contextualData ? `
ORGANIZATIONAL CONTEXT:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- Slack: ${msg.content}`).join('\n') : ''}
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- Doc: ${doc.excerpt}`).join('\n') : ''}
` : ''}

TASK: The user edited the target node. Intelligently update the entire graph to maintain logical consistency and strategic coherence.

ANALYSIS REQUIREMENTS:
1. Understand how the edited node changes the logical flow
2. Identify which other nodes need updating for consistency
3. Generate new/modified nodes that align with the edit
4. Maintain proper ${isExpertMode ? '5→2' : '3→1'} structure
5. Preserve strategic relevance and business logic

Return ONLY valid JSON with this structure:
{
  "updatedNodes": [
    {
      "id": "node-id",
      "action": "modify" | "delete" | "add",
      "data": {
        "label": "Updated node title",
        "description": "Updated description",
        "order": 1,
        "nodeType": "consequence" | "forecast",
        "probability": 75
      },
      "rationale": "Why this node needed updating"
    }
  ],
  "newEdges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "rationale": "Why this connection was created/modified"
    }
  ],
  "analysisRationale": "Overall explanation of how the graph was intelligently updated",
  "strategicImplications": "What these changes mean for the analysis"
}

Focus on maintaining logical coherence while respecting the user's editorial intent.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw graph update response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for graph update:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}

async function handleNodeDelete(
  targetNode: DecisionNode,
  allNodes: DecisionNode[],
  allEdges: DecisionEdge[],
  analysisType: string,
  isExpertMode: boolean,
  contextualData?: any
) {
  // Similar structure to handleNodeEdit but focused on deletion impact
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert decision analyst specializing in graph coherence maintenance.

The user deleted: "${targetNode.data.label}" (Order ${targetNode.data.order})

Analyze the remaining graph and suggest intelligent updates to maintain logical flow and fill gaps left by the deletion. Generate replacement nodes or modify existing ones to preserve analytical completeness.

Return the same JSON structure as node edit, focusing on gap-filling and logical consistency.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    return {
      updatedNodes: [],
      newEdges: [],
      analysisRationale: "Graph maintained after node deletion",
      strategicImplications: "Analysis structure preserved"
    }
  }
}

async function handleNodeAdd(
  targetNode: DecisionNode,
  allNodes: DecisionNode[],
  allEdges: DecisionEdge[],
  analysisType: string,
  isExpertMode: boolean,
  contextualData?: any
) {
  // Handle manual node additions with intelligent suggestions
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert decision analyst helping with intelligent node addition.

The user added: "${targetNode.data.label}" (Order ${targetNode.data.order})

Analyze how this addition affects the overall graph logic and suggest related nodes or modifications that would enhance the analysis coherence and completeness.

Return suggestions for additional nodes that would strengthen the analysis.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    return {
      updatedNodes: [],
      newEdges: [],
      analysisRationale: "Node added to analysis",
      strategicImplications: "Analysis expanded with new perspective"
    }
  }
}