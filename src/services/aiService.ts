import { DecisionNode, DecisionEdge, DecisionAnalysis, Commentary } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'
import { generateOptimizedTreeLayout } from '@/utils/layoutUtils'

// Helper function to style cross-root connection edges based on relationship type
function getConnectionStyle(strength: string, nature: string) {
  const strengthMap: Record<string, number> = {
    'weak': 1.5,
    'moderate': 2.5,
    'strong': 3.5
  }

  const natureColors: Record<string, string> = {
    'enables': '#10b981',      // green
    'amplifies': '#3b82f6',    // blue
    'causes': '#8b5cf6',       // purple
    'blocks': '#ef4444',       // red
    'prevents': '#dc2626',     // dark red
    'reduces': '#f59e0b'       // orange
  }

  const strokeWidth = strengthMap[strength] || 2
  const strokeColor = natureColors[nature] || '#6b7280'

  return {
    style: {
      stroke: strokeColor,
      strokeWidth: strokeWidth,
      strokeDasharray: strength === 'weak' ? '5,5' : undefined
    },
    labelColor: strokeColor
  }
}


interface SlackContext {
  id: string
  channel: string
  text: string
  user: string
  timestamp: string
  permalink?: string
}

export async function generateConsequences(decision: string, useDocuments: boolean = false, isExpertMode: boolean = true, firstOrderCount: number = 5, secondOrderCount: number = 2, slackContext: SlackContext[] = []): Promise<DecisionAnalysis> {
  try {
    // Use same-origin if NEXT_PUBLIC_BACKEND_URL is empty or not set (production mode)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'decision',
        input: decision,
        useDocuments,
        slackContext: slackContext.length > 0 ? slackContext : undefined,
        isExpertMode,
        firstOrderCount,
        secondOrderCount,
        timestamp: Date.now() // Ensures fresh analysis each time
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate analysis')
    }

    const data = await response.json()
    const analysis = data.analysis

    // Create nodes
    const nodes: DecisionNode[] = []
    const edges: DecisionEdge[] = []

    // Check if this is a multi-root analysis
    if (analysis.multiRoot && analysis.rootInputs) {
      // Create multiple root nodes
      const rootInputs = analysis.rootInputs
      const rootSpacing = 500 // Horizontal spacing between roots

      rootInputs.forEach((rootInput: string, rootIdx: number) => {
        const rootNode: DecisionNode = {
          id: `root-${rootIdx}`,
          type: 'interactive',
          data: {
            label: rootInput,
            order: 0,
            nodeType: 'decision'
          },
          position: { x: 200 + (rootIdx * rootSpacing), y: 50 }
        }
        nodes.push(rootNode)
      })

      // Add cross-root connection edges
      if (analysis.crossRootConnections && analysis.crossRootConnections.length > 0) {
        analysis.crossRootConnections.forEach((connection: any, idx: number) => {
          const edgeStyle = getConnectionStyle(connection.strength, connection.nature)
          edges.push({
            id: `cross-root-${idx}`,
            source: `root-${connection.from}`,
            target: `root-${connection.to}`,
            type: 'smoothstep',
            animated: true,
            style: edgeStyle.style,
            label: `${connection.nature} (${connection.strength})`,
            labelStyle: { fill: edgeStyle.labelColor, fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
            data: { explanation: connection.explanation }
          } as DecisionEdge)
        })
      }
    } else {
      // Single root node
      const rootNode: DecisionNode = {
        id: 'root',
        type: 'interactive',
        data: {
          label: decision,
          order: 0,
          nodeType: 'decision'
        },
        position: { x: 400, y: 50 }
      }
      nodes.push(rootNode)
    }

    // First order nodes
    analysis.firstOrder.forEach((consequence: { title: string; description: string; sentiment?: string; rootIndex?: number; rootLabel?: string }, index: number) => {
      const nodeId = `first-${index}`
      const node: DecisionNode = {
        id: nodeId,
        type: 'interactive',
        data: {
          label: consequence.title,
          description: consequence.description,
          order: 1,
          nodeType: 'consequence',
          sentiment: consequence.sentiment as 'positive' | 'negative' | 'neutral' || 'neutral'
        },
        position: { x: 0, y: 0 } // Will be set by layout function
      }
      nodes.push(node)

      // Edge from appropriate root to first order
      const sourceRoot = consequence.rootIndex !== undefined ? `root-${consequence.rootIndex}` : 'root'
      edges.push({
        id: `edge-${sourceRoot}-${nodeId}`,
        source: sourceRoot,
        target: nodeId,
        type: 'smoothstep',
        animated: true
      })

      // Second order nodes for this first order consequence
      if (analysis.secondOrder[index]) {
        analysis.secondOrder[index].forEach((secondConsequence: { title: string; description: string; sentiment?: string }, secondIndex: number) => {
          const secondNodeId = `second-${index}-${secondIndex}`
          const secondNode: DecisionNode = {
            id: secondNodeId,
            type: 'interactive',
            data: {
              label: secondConsequence.title,
              description: secondConsequence.description,
              order: 2,
              nodeType: 'consequence',
              sentiment: secondConsequence.sentiment as 'positive' | 'negative' | 'neutral' || 'neutral'
            },
            position: { x: 0, y: 0 } // Will be set by layout function
          }
          nodes.push(secondNode)

          // Edge from first order to second order
          edges.push({
            id: `edge-${nodeId}-${secondNodeId}`,
            source: nodeId,
            target: secondNodeId,
            type: 'smoothstep',
            animated: true
          })
        })
      }
    })

    // Apply optimized tree layout with auto-sizing and overlap prevention
    const layoutNodes = generateOptimizedTreeLayout(nodes, false) // Normal layout for decisions

    return {
      nodes: layoutNodes,
      edges,
      commentary: [],
      mode: { type: 'decision', rootInput: decision }
    }

  } catch (error) {
    console.error('Error generating consequences:', error)
    // Return minimal structure on error
    const rootNode: DecisionNode = {
      id: 'root',
      type: 'interactive',
      data: {
        label: decision,
        order: 0,
        nodeType: 'decision'
      },
      position: { x: 400, y: 50 }
    }

    return {
      nodes: [rootNode],
      edges: [],
      commentary: [],
      mode: { type: 'decision', rootInput: decision }
    }
  }
}

export async function generateCausalPathways(forecast: string, useDocuments: boolean = false, isExpertMode: boolean = true, firstOrderCount: number = 5, secondOrderCount: number = 2, slackContext: SlackContext[] = []): Promise<DecisionAnalysis> {
  try {
    // Use same-origin if NEXT_PUBLIC_BACKEND_URL is empty or not set (production mode)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const response = await fetch(`${backendUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'forecast',
        input: forecast,
        useDocuments,
        slackContext: slackContext.length > 0 ? slackContext : undefined,
        isExpertMode,
        firstOrderCount,
        secondOrderCount,
        timestamp: Date.now() // Ensures fresh analysis each time
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate analysis')
    }

    const data = await response.json()
    const analysis = data.analysis

    // Create nodes (similar structure to consequences but representing causes)
    const nodes: DecisionNode[] = []
    const edges: DecisionEdge[] = []

    // Check if this is a multi-root analysis
    if (analysis.multiRoot && analysis.rootInputs) {
      // Create multiple root nodes
      const rootInputs = analysis.rootInputs
      const rootSpacing = 500 // Horizontal spacing between roots

      rootInputs.forEach((rootInput: string, rootIdx: number) => {
        const rootNode: DecisionNode = {
          id: `root-${rootIdx}`,
          type: 'interactive',
          data: {
            label: rootInput,
            order: 0,
            nodeType: 'forecast'
          },
          position: { x: 200 + (rootIdx * rootSpacing), y: 50 }
        }
        nodes.push(rootNode)
      })

      // Add cross-root connection edges
      if (analysis.crossRootConnections && analysis.crossRootConnections.length > 0) {
        analysis.crossRootConnections.forEach((connection: any, idx: number) => {
          const edgeStyle = getConnectionStyle(connection.strength, connection.nature)
          edges.push({
            id: `cross-root-${idx}`,
            source: `root-${connection.from}`,
            target: `root-${connection.to}`,
            type: 'smoothstep',
            animated: true,
            style: edgeStyle.style,
            label: `${connection.nature} (${connection.strength})`,
            labelStyle: { fill: edgeStyle.labelColor, fontWeight: 600, fontSize: 11 },
            labelBgStyle: { fill: 'white', fillOpacity: 0.9 },
            data: { explanation: connection.explanation }
          } as DecisionEdge)
        })
      }
    } else {
      // Root node (the forecast)
      const rootNode: DecisionNode = {
        id: 'root',
        type: 'interactive',
        data: {
          label: forecast,
          order: 0,
          nodeType: 'forecast'
        },
        position: { x: 400, y: 50 }
      }
      nodes.push(rootNode)
    }

    // Create the causal tree (similar to consequence tree but with different semantics)
    analysis.firstOrder.forEach((cause: { title: string; description: string; probability: number; sentiment?: string; rootIndex?: number; rootLabel?: string }, index: number) => {
      const nodeId = `cause-${index}`
      const node: DecisionNode = {
        id: nodeId,
        type: 'interactive',
        data: {
          label: cause.title,
          description: cause.description,
          order: 1,
          nodeType: 'forecast',
          probability: cause.probability || 50,
          sentiment: cause.sentiment as 'positive' | 'negative' | 'neutral' || 'neutral'
        },
        position: { x: 0, y: 0 }
      }
      nodes.push(node)

      // Edge from cause to appropriate root (causes point TO the outcome)
      const targetRoot = cause.rootIndex !== undefined ? `root-${cause.rootIndex}` : 'root'
      edges.push({
        id: `edge-${nodeId}-${targetRoot}`,
        source: nodeId,
        target: targetRoot,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      })

      if (analysis.secondOrder[index]) {
        analysis.secondOrder[index].forEach((rootCause: { title: string; description: string; probability: number; sentiment?: string }, secondIndex: number) => {
          const secondNodeId = `root-cause-${index}-${secondIndex}`
          const secondNode: DecisionNode = {
            id: secondNodeId,
            type: 'interactive',
            data: {
              label: rootCause.title,
              description: rootCause.description,
              order: 2,
              nodeType: 'forecast',
              probability: rootCause.probability || 50,
              sentiment: rootCause.sentiment as 'positive' | 'negative' | 'neutral' || 'neutral'
            },
            position: { x: 0, y: 0 }
          }
          nodes.push(secondNode)

          edges.push({
            id: `edge-${secondNodeId}-${nodeId}`,
            source: secondNodeId,
            target: nodeId,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#f59e0b', strokeWidth: 1.5 }
          })
        })
      }
    })

    const layoutNodes = generateOptimizedTreeLayout(nodes, true) // Reversed layout for forecast

    return {
      nodes: layoutNodes,
      edges,
      commentary: [],
      mode: { type: 'forecast', rootInput: forecast }
    }

  } catch (error) {
    console.error('Error generating causal pathways:', error)
    const rootNode: DecisionNode = {
      id: 'root',
      type: 'interactive',
      data: {
        label: forecast,
        order: 0,
        nodeType: 'forecast'
      },
      position: { x: 400, y: 50 }
    }

    return {
      nodes: [rootNode],
      edges: [],
      commentary: [],
      mode: { type: 'forecast', rootInput: forecast }
    }
  }
}

export async function generateCommentary(
  analysis: DecisionAnalysis,
  triggeredBy: Commentary['triggeredBy'],
  relatedNodes: string[]
): Promise<Commentary> {
  try {
    // Use same-origin if NEXT_PUBLIC_BACKEND_URL is empty or not set (production mode)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    const response = await fetch(`${backendUrl}/api/commentary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        analysis,
        triggeredBy,
        relatedNodes
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate commentary')
    }

    const commentary = await response.json()
    return {
      ...commentary,
      timestamp: new Date(commentary.timestamp)
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