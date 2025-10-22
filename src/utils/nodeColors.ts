// Utility for consistent node coloring and visual hierarchy

export const getNodeOrderInfo = (order: number) => {
  switch (order) {
    case 0: // Root node
      return {
        label: 'Root Decision',
        borderColor: 'border-blue-500 dark:border-blue-400',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        textColor: 'text-blue-900 dark:text-blue-100'
      }
    case 1: // First order
      return {
        label: '1st Order',
        borderColor: 'border-green-500 dark:border-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        textColor: 'text-green-900 dark:text-green-100'
      }
    case 2: // Second order
      return {
        label: '2nd Order',
        borderColor: 'border-orange-500 dark:border-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        textColor: 'text-orange-900 dark:text-orange-100'
      }
    default:
      return {
        label: 'Node',
        borderColor: 'border-gray-300 dark:border-gray-600',
        bgColor: 'bg-gray-50 dark:bg-gray-800',
        textColor: 'text-gray-900 dark:text-white'
      }
  }
}

// Enhanced color system for better visual hierarchy
export const getEdgeStyle = (sourceOrder: number, targetOrder: number) => {
  if (sourceOrder === 0 && targetOrder === 1) {
    // Root to first order - stronger blue
    return {
      stroke: '#3b82f6',
      strokeWidth: 2,
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#3b82f6'
      }
    }
  } else if (sourceOrder === 1 && targetOrder === 2) {
    // First to second order - green
    return {
      stroke: '#10b981',
      strokeWidth: 2,
      markerEnd: {
        type: 'arrowclosed' as const,
        color: '#10b981'
      }
    }
  }

  // Default edge style
  return {
    stroke: '#6b7280',
    strokeWidth: 1,
    markerEnd: {
      type: 'arrowclosed' as const,
      color: '#6b7280'
    }
  }
}