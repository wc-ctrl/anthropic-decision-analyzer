import { useEffect, useRef } from 'react'

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server'

  let sessionId = sessionStorage.getItem('claudeswitz-session-id')
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('claudeswitz-session-id', sessionId)
  }
  return sessionId
}

async function logEvent(type: string, data?: any) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    await fetch(`${backendUrl}/api/analytics/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        sessionId: getSessionId(),
        data
      })
    })
  } catch (error) {
    // Silently fail - don't disrupt user experience
    console.error('Analytics logging failed:', error)
  }
}

export function useAnalytics() {
  const hasLoggedVisit = useRef(false)

  useEffect(() => {
    // Log visit once per session
    if (!hasLoggedVisit.current) {
      logEvent('visit')
      hasLoggedVisit.current = true
    }
  }, [])

  const logQuery = (query: string, analysisType: string) => {
    logEvent('query', { query, analysisType })
  }

  const logFeatureUse = (feature: string) => {
    logEvent('feature_use', { feature })
  }

  return {
    logQuery,
    logFeatureUse
  }
}
