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
    model: 'claude-sonnet-4-20250514',
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
  // Find child nodes that need to be handled
  const childNodes = allNodes.filter(node =>
    allEdges.some(edge => edge.source === targetNode.id && edge.target === node.id)
  )

  // Find parent nodes for potential reconnection
  const parentNodes = allNodes.filter(node =>
    allEdges.some(edge => edge.source === node.id && edge.target === targetNode.id)
  )

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2500,
    messages: [{
      role: 'user',
      content: `You are an expert decision analyst specializing in intelligent tree restructuring.

DELETION TARGET: "${targetNode.data.label}" (Order ${targetNode.data.order})
Description: ${targetNode.data.description || 'No description'}
Sentiment: ${targetNode.data.sentiment || 'neutral'}

AFFECTED CHILD NODES (will be orphaned):
${childNodes.map(node => `- ${node.data.label} (Order ${node.data.order})`).join('\n') || 'None'}

PARENT NODES (potential reconnection points):
${parentNodes.map(node => `- ${node.data.label} (Order ${node.data.order})`).join('\n') || 'None'}

REMAINING GRAPH STRUCTURE:
${allNodes.filter(n => n.id !== targetNode.id).map(node => `- ${node.data.label} (Order ${node.data.order}): ${node.data.description || ''}`).join('\n')}

${contextualData ? `
ORGANIZATIONAL CONTEXT:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- Slack: ${msg.content}`).join('\n') : ''}
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- Doc: ${doc.excerpt}`).join('\n') : ''}
` : ''}

TASK: Intelligently restructure the decision tree after node deletion:

1. **ELIMINATE**: Remove child chains that no longer make logical sense
2. **RECONNECT**: Move orphaned children to appropriate new parents
3. **REPLACE**: Generate new nodes to fill critical analytical gaps
4. **REORGANIZE**: Ensure logical flow and strategic completeness

Consider:
- Which orphaned children should be eliminated vs reconnected?
- Are there logical gaps that need filling with new nodes?
- How do we maintain the analytical integrity of the ${analysisType} analysis?
- What new connections would preserve strategic logic?

Return ONLY valid JSON with this structure:
{
  "treeOperations": {
    "eliminate": ["child-node-id-1", "child-node-id-2"],
    "reconnect": [
      {
        "nodeId": "orphaned-node-id",
        "newParentId": "new-parent-id",
        "rationale": "Why this reconnection makes sense"
      }
    ],
    "newNodes": [
      {
        "id": "replacement-node-1",
        "data": {
          "label": "New node title",
          "description": "Description",
          "order": 2,
          "nodeType": "${analysisType === 'decision' ? 'consequence' : 'forecast'}",
          "sentiment": "positive",
          "probability": 75
        },
        "parentId": "parent-node-id",
        "rationale": "Why this new node fills an important gap"
      }
    ]
  },
  "newEdges": [
    {
      "id": "new-edge-id",
      "source": "source-id",
      "target": "target-id",
      "rationale": "Why this connection was created"
    }
  ],
  "analysisRationale": "How the tree was intelligently restructured to maintain analytical integrity",
  "strategicImplications": "What the restructuring means for the overall strategic analysis"
}

Focus on preserving analytical completeness while respecting the deletion intent.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw deletion restructuring response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for deletion restructuring:', error)

    // Fallback: eliminate all children
    return {
      treeOperations: {
        eliminate: childNodes.map(n => n.id),
        reconnect: [],
        newNodes: []
      },
      newEdges: [],
      analysisRationale: "Basic deletion: removed node and all dependent children",
      strategicImplications: "Tree structure simplified, some analytical depth lost"
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
    model: 'claude-sonnet-4-20250514',
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