import { useEffect, useRef, useCallback } from 'react'

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
  const sessionStart = useRef(Date.now())

  useEffect(() => {
    // Log visit once per session
    if (!hasLoggedVisit.current) {
      logEvent('visit')
      hasLoggedVisit.current = true
    }

    // Log session duration on unload
    const handleUnload = () => {
      const durationSec = Math.round((Date.now() - sessionStart.current) / 1000)
      // Use sendBeacon for reliability on page close
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      navigator.sendBeacon?.(
        `${backendUrl}/api/analytics/log`,
        JSON.stringify({
          type: 'session_end',
          sessionId: getSessionId(),
          data: { durationSec }
        })
      )
    }

    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  const logQuery = useCallback((query: string, analysisType: string) => {
    logEvent('query', { query, analysisType })
  }, [])

  const logFeatureUse = useCallback((feature: string) => {
    logEvent('feature_use', { feature })
  }, [])

  const logModeSwitch = useCallback((fromMode: string, toMode: string) => {
    logEvent('mode_switch', { fromMode, toMode })
  }, [])

  const logFrameworkSelect = useCallback((frameworkId: string, frameworkName: string) => {
    logEvent('framework_select', { frameworkId, frameworkName })
  }, [])

  const logExport = useCallback((format: string) => {
    logEvent('export', { format })
  }, [])

  const logShare = useCallback((channel: string) => {
    logEvent('share', { channel })
  }, [])

  return {
    logQuery,
    logFeatureUse,
    logModeSwitch,
    logFrameworkSelect,
    logExport,
    logShare
  }
}
