import { DecisionNode, DecisionEdge, DecisionAnalysis, Commentary } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

// Generate layout positions for nodes in a tree structure
function generateTreeLayout(nodes: DecisionNode[]): DecisionNode[] {
  const rootNode = nodes.find(n => n.data.order === 0)
  if (!rootNode) return nodes

  const nodesByOrder: { [key: number]: DecisionNode[] } = {}
  nodes.forEach(node => {
    if (!nodesByOrder[node.data.order]) {
      nodesByOrder[node.data.order] = []
    }
    nodesByOrder[node.data.order].push(node)
  })

  // Position root node
  rootNode.position = { x: 400, y: 50 }

  // Position first order nodes
  const firstOrder = nodesByOrder[1] || []
  firstOrder.forEach((node, index) => {
    const startX = 400 - ((firstOrder.length - 1) * 250) / 2
    node.position = { x: startX + index * 250, y: 200 }
  })

  // Position second order nodes based on their parent relationships
  const secondOrder = nodesByOrder[2] || []

  // Group second order nodes by their parent (first order node)
  const secondOrderByParent: { [parentIndex: number]: DecisionNode[] } = {}
  secondOrder.forEach(node => {
    // Extract parent index from node ID (format: second-parentIndex-childIndex)
    const parts = node.id.split('-')
    if (parts.length >= 3) {
      const parentIndex = parseInt(parts[1])
      if (!secondOrderByParent[parentIndex]) {
        secondOrderByParent[parentIndex] = []
      }
      secondOrderByParent[parentIndex].push(node)
    }
  })

  // Position each group of second order nodes under their parent
  firstOrder.forEach((parentNode, parentIndex) => {
    const children = secondOrderByParent[parentIndex] || []
    children.forEach((child, childIndex) => {
      const totalChildren = children.length
      const spacing = Math.min(180, 300 / Math.max(totalChildren - 1, 1))
      const startX = parentNode.position.x - ((totalChildren - 1) * spacing) / 2
      child.position = {
        x: startX + childIndex * spacing,
        y: 380
      }
    })
  })

  return nodes
}

export async function generateConsequences(decision: string): Promise<DecisionAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'decision',
        input: decision
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

    // Apply tree layout
    const layoutNodes = generateTreeLayout(nodes)

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

export async function generateCausalPathways(forecast: string): Promise<DecisionAnalysis> {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'forecast',
        input: forecast
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
    analysis.firstOrder.forEach((cause: { title: string; description: string }, index: number) => {
      const nodeId = `cause-${index}`
      const node: DecisionNode = {
        id: nodeId,
        type: 'interactive',
        data: {
          label: cause.title,
          description: cause.description,
          order: 1,
          nodeType: 'forecast'
        },
        position: { x: 0, y: 0 }
      }
      nodes.push(node)

      edges.push({
        id: `edge-${nodeId}-root`,
        source: nodeId,
        target: 'root',
        type: 'smoothstep',
        animated: true
      })

      if (analysis.secondOrder[index]) {
        analysis.secondOrder[index].forEach((rootCause: { title: string; description: string }, secondIndex: number) => {
          const secondNodeId = `root-cause-${index}-${secondIndex}`
          const secondNode: DecisionNode = {
            id: secondNodeId,
            type: 'interactive',
            data: {
              label: rootCause.title,
              description: rootCause.description,
              order: 2,
              nodeType: 'forecast'
            },
            position: { x: 0, y: 0 }
          }
          nodes.push(secondNode)

          edges.push({
            id: `edge-${secondNodeId}-${nodeId}`,
            source: secondNodeId,
            target: nodeId,
            type: 'smoothstep',
            animated: true
          })
        })
      }
    })

    const layoutNodes = generateTreeLayout(nodes)

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