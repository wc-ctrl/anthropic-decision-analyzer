export interface AnalyticsEvent {
  type: 'visit' | 'query' | 'feature_use' | 'mode_switch' | 'framework_select' | 'export' | 'share' | 'session_end'
  timestamp: string
  sessionId: string
  data?: {
    query?: string
    analysisType?: string
    feature?: string
    fromMode?: string
    toMode?: string
    frameworkId?: string
    frameworkName?: string
    format?: string
    channel?: string
    durationSec?: number
  }
}

export interface AnalyticsStats {
  overview: {
    totalVisits: number
    uniqueVisitors: number
    repeatVisitors: number
    repeatVisitorRate: string
    visitsLast24h: number
    visitsLast7days: number
    avgSessionDurationSec: number
  }
  featureUsage: Record<string, number>
  analysisTypes: Record<string, number>
  modeSwitches: Record<string, number>
  frameworksUsed: Record<string, number>
  exports: Record<string, number>
  shares: Record<string, number>
}
