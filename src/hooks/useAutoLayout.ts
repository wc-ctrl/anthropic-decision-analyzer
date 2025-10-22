'use client'

import { useCallback } from 'react'
import { DecisionNode } from '@/types/decision'
import { generateOptimizedTreeLayout } from '@/utils/layoutUtils'

export function useAutoLayout() {
  const applyAutoLayout = useCallback((nodes: DecisionNode[]): DecisionNode[] => {
    // Apply the optimized layout algorithm
    return generateOptimizedTreeLayout(nodes)
  }, [])

  const recalculateLayout = useCallback((
    nodes: DecisionNode[],
    setNodes: (nodes: DecisionNode[]) => void
  ) => {
    const layoutNodes = applyAutoLayout(nodes)
    setNodes(layoutNodes)
  }, [applyAutoLayout])

  return {
    applyAutoLayout,
    recalculateLayout
  }
}