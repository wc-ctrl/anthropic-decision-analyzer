'use client'

import { useCallback } from 'react'
import { DecisionNode } from '@/types/decision'
import { generateOptimizedTreeLayout } from '@/utils/layoutUtils'

export function useAutoLayout() {
  const applyAutoLayout = useCallback((nodes: DecisionNode[], isReversed: boolean = false): DecisionNode[] => {
    // Apply the optimized layout algorithm
    return generateOptimizedTreeLayout(nodes, isReversed)
  }, [])

  const recalculateLayout = useCallback((
    nodes: DecisionNode[],
    setNodes: (nodes: DecisionNode[]) => void,
    isReversed: boolean = false
  ) => {
    const layoutNodes = applyAutoLayout(nodes, isReversed)
    setNodes(layoutNodes)
  }, [applyAutoLayout])

  return {
    applyAutoLayout,
    recalculateLayout
  }
}