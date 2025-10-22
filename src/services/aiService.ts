import { DecisionNode, DecisionEdge, DecisionAnalysis, Commentary } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'
import { generateOptimizedTreeLayout } from '@/utils/layoutUtils'


export async function generateConsequences(decision: string, useSlack: boolean = false, useGDrive: boolean = false): Promise<DecisionAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'decision',
        input: decision,
        useSlack,
        useGDrive
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

    // Root node
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

    // First order nodes
    analysis.firstOrder.forEach((consequence: { title: string; description: string }, index: number) => {
      const nodeId = `first-${index}`
      const node: DecisionNode = {
        id: nodeId,
        type: 'interactive',
        data: {
          label: consequence.title,
          description: consequence.description,
          order: 1,
          nodeType: 'consequence'
        },
        position: { x: 0, y: 0 } // Will be set by layout function
      }
      nodes.push(node)

      // Edge from root to first order
      edges.push({
        id: `edge-root-${nodeId}`,
        source: 'root',
        target: nodeId,
        type: 'smoothstep',
        animated: true
      })

      // Second order nodes for this first order consequence
      if (analysis.secondOrder[index]) {
        analysis.secondOrder[index].forEach((secondConsequence: { title: string; description: string }, secondIndex: number) => {
          const secondNodeId = `second-${index}-${secondIndex}`
          const secondNode: DecisionNode = {
            id: secondNodeId,
            type: 'interactive',
            data: {
              label: secondConsequence.title,
              description: secondConsequence.description,
              order: 2,
              nodeType: 'consequence'
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

export async function generateCausalPathways(forecast: string, useSlack: boolean = false, useGDrive: boolean = false): Promise<DecisionAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'forecast',
        input: forecast,
        useSlack,
        useGDrive
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

    // Create the causal tree (similar to consequence tree but with different semantics)
    analysis.firstOrder.forEach((cause: { title: string; description: string; probability: number }, index: number) => {
      const nodeId = `cause-${index}`
      const node: DecisionNode = {
        id: nodeId,
        type: 'interactive',
        data: {
          label: cause.title,
          description: cause.description,
          order: 1,
          nodeType: 'forecast',
          probability: cause.probability || 50
        },
        position: { x: 0, y: 0 }
      }
      nodes.push(node)

      edges.push({
        id: `edge-${nodeId}-root`,
        source: nodeId,
        target: 'root',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      })

      if (analysis.secondOrder[index]) {
        analysis.secondOrder[index].forEach((rootCause: { title: string; description: string; probability: number }, secondIndex: number) => {
          const secondNodeId = `root-cause-${index}-${secondIndex}`
          const secondNode: DecisionNode = {
            id: secondNodeId,
            type: 'interactive',
            data: {
              label: rootCause.title,
              description: rootCause.description,
              order: 2,
              nodeType: 'forecast',
              probability: rootCause.probability || 50
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
    const response = await fetch('/api/commentary', {
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