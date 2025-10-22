import { DecisionNode, DecisionEdge } from '@/types/decision'

export interface NodeDimensions {
  width: number
  height: number
}

export interface LayoutNode extends DecisionNode {
  dimensions: NodeDimensions
}

// Calculate node dimensions based on content length
export function calculateNodeDimensions(node: DecisionNode): NodeDimensions {
  const title = node.data.label
  const description = node.data.description || ''

  // Base dimensions
  const minWidth = 200
  const maxWidth = 400
  const minHeight = 80
  const padding = 32 // 16px padding on each side
  const lineHeight = 20
  const titleLineHeight = 24
  const descriptionLineHeight = 16

  // Calculate width based on longest line
  const titleWords = title.split(' ')
  const descriptionWords = description.split(' ')

  // Estimate character width (approximately 8px per character)
  const charWidth = 8

  // Calculate title width requirements
  const titleLength = title.length
  const estimatedTitleWidth = Math.min(maxWidth - padding, Math.max(minWidth - padding, titleLength * charWidth))

  // Calculate description width requirements
  const descriptionLength = description.length
  const estimatedDescriptionWidth = descriptionLength > 0
    ? Math.min(maxWidth - padding, Math.max(minWidth - padding, descriptionLength * charWidth))
    : 0

  // Take the maximum width needed
  const contentWidth = Math.max(estimatedTitleWidth, estimatedDescriptionWidth)
  const finalWidth = Math.min(maxWidth, Math.max(minWidth, contentWidth + padding))

  // Calculate height based on text wrapping
  const titleWrappedLines = Math.ceil((titleLength * charWidth) / (finalWidth - padding))
  const descriptionWrappedLines = descriptionLength > 0
    ? Math.ceil((descriptionLength * charWidth) / (finalWidth - padding))
    : 0

  const titleHeight = titleWrappedLines * titleLineHeight
  const descriptionHeight = descriptionWrappedLines * descriptionLineHeight
  const headerHeight = 24 // Order indicator and buttons
  const spacing = descriptionLength > 0 ? 8 : 0

  const finalHeight = Math.max(minHeight, headerHeight + titleHeight + spacing + descriptionHeight + padding)

  return {
    width: finalWidth,
    height: finalHeight
  }
}

// Enhanced tree layout algorithm with overlap prevention
export function generateOptimizedTreeLayout(nodes: DecisionNode[]): DecisionNode[] {
  const layoutNodes: LayoutNode[] = nodes.map(node => ({
    ...node,
    dimensions: calculateNodeDimensions(node)
  }))

  // Group nodes by order
  const nodesByOrder: { [key: number]: LayoutNode[] } = {}
  layoutNodes.forEach(node => {
    if (!nodesByOrder[node.data.order]) {
      nodesByOrder[node.data.order] = []
    }
    nodesByOrder[node.data.order].push(node)
  })

  // Layout parameters
  const levelGap = 180 // Vertical gap between levels
  const nodeGap = 40 // Minimum horizontal gap between nodes

  // Position root node
  const rootNodes = nodesByOrder[0] || []
  if (rootNodes.length > 0) {
    const rootNode = rootNodes[0]
    rootNode.position = { x: 0, y: 0 } // Will center later
  }

  // Position first order nodes
  const firstOrder = nodesByOrder[1] || []
  if (firstOrder.length > 0) {
    const totalFirstOrderWidth = firstOrder.reduce((sum, node, index) => {
      return sum + node.dimensions.width + (index > 0 ? nodeGap : 0)
    }, 0)

    let currentX = -totalFirstOrderWidth / 2

    firstOrder.forEach((node, index) => {
      node.position = {
        x: currentX + node.dimensions.width / 2,
        y: levelGap
      }
      currentX += node.dimensions.width + nodeGap
    })
  }

  // Position second order nodes
  const secondOrder = nodesByOrder[2] || []
  if (secondOrder.length > 0) {
    // Group second order nodes by their parent
    const secondOrderByParent: { [parentIndex: number]: LayoutNode[] } = {}
    secondOrder.forEach(node => {
      const parts = node.id.split('-')
      if (parts.length >= 3 && parts[0] === 'second') {
        const parentIndex = parseInt(parts[1])
        if (!secondOrderByParent[parentIndex]) {
          secondOrderByParent[parentIndex] = []
        }
        secondOrderByParent[parentIndex].push(node)
      }
    })

    // Position each group under their parent
    firstOrder.forEach((parentNode, parentIndex) => {
      const children = secondOrderByParent[parentIndex] || []
      if (children.length === 0) return

      // Calculate total width needed for this parent's children
      const totalChildrenWidth = children.reduce((sum, child, index) => {
        return sum + child.dimensions.width + (index > 0 ? nodeGap : 0)
      }, 0)

      // Position children centered under parent
      let childX = parentNode.position.x - totalChildrenWidth / 2

      children.forEach((child, childIndex) => {
        child.position = {
          x: childX + child.dimensions.width / 2,
          y: levelGap * 2
        }
        childX += child.dimensions.width + nodeGap
      })
    })
  }

  // Center the entire tree
  const allNodes = layoutNodes
  if (allNodes.length > 0) {
    const bounds = calculateBounds(allNodes)
    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2

    // Offset all nodes to center the tree at (400, 200)
    const targetCenterX = 400
    const targetCenterY = 200
    const offsetX = targetCenterX - centerX
    const offsetY = targetCenterY - centerY

    allNodes.forEach(node => {
      node.position.x += offsetX
      node.position.y += offsetY
    })
  }

  return layoutNodes.map(({ dimensions, ...node }) => node)
}

// Calculate bounding box of all nodes
function calculateBounds(nodes: LayoutNode[]) {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  nodes.forEach(node => {
    const left = node.position.x - node.dimensions.width / 2
    const right = node.position.x + node.dimensions.width / 2
    const top = node.position.y - node.dimensions.height / 2
    const bottom = node.position.y + node.dimensions.height / 2

    minX = Math.min(minX, left)
    maxX = Math.max(maxX, right)
    minY = Math.min(minY, top)
    maxY = Math.max(maxY, bottom)
  })

  return { minX, maxX, minY, maxY }
}

// Check if two nodes overlap
export function nodesOverlap(node1: LayoutNode, node2: LayoutNode, buffer: number = 20): boolean {
  const node1Bounds = {
    left: node1.position.x - node1.dimensions.width / 2 - buffer,
    right: node1.position.x + node1.dimensions.width / 2 + buffer,
    top: node1.position.y - node1.dimensions.height / 2 - buffer,
    bottom: node1.position.y + node1.dimensions.height / 2 + buffer
  }

  const node2Bounds = {
    left: node2.position.x - node2.dimensions.width / 2,
    right: node2.position.x + node2.dimensions.width / 2,
    top: node2.position.y - node2.dimensions.height / 2,
    bottom: node2.position.y + node2.dimensions.height / 2
  }

  return !(node1Bounds.right < node2Bounds.left ||
           node1Bounds.left > node2Bounds.right ||
           node1Bounds.bottom < node2Bounds.top ||
           node1Bounds.top > node2Bounds.bottom)
}