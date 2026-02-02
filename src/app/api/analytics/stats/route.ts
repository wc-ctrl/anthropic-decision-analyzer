import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { AnalyticsEvent } from '@/types/analytics'

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-events.jsonl')

const emptyStats = {
  overview: {
    totalVisits: 0,
    uniqueVisitors: 0,
    repeatVisitors: 0,
    repeatVisitorRate: '0',
    visitsLast24h: 0,
    visitsLast7days: 0,
    avgSessionDurationSec: 0,
  },
  queryCategories: {},
  featureUsage: {},
  analysisTypes: {},
  modeSwitches: {},
  frameworksUsed: {},
  exports: {},
  shares: {},
  privacyNote:
    'Analytics are aggregated locally. No individual queries are stored or displayed.',
}

export async function GET() {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, 'utf-8')
    const lines = raw.trim().split('\n').filter(Boolean)
    const events: AnalyticsEvent[] = lines.map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean) as AnalyticsEvent[]

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000

    // Visits
    const visits = events.filter(e => e.type === 'visit')
    const sessions = new Set(visits.map(e => e.sessionId))
    const sessionVisitCounts = new Map<string, number>()
    for (const v of visits) {
      sessionVisitCounts.set(v.sessionId, (sessionVisitCounts.get(v.sessionId) || 0) + 1)
    }
    const repeatSessions = [...sessionVisitCounts.values()].filter(c => c > 1).length
    const visitsLast24h = visits.filter(e => now - new Date(e.timestamp).getTime() < day).length
    const visitsLast7days = visits.filter(e => now - new Date(e.timestamp).getTime() < 7 * day).length

    // Session durations
    const sessionEnds = events.filter(e => e.type === 'session_end' && e.data?.durationSec)
    const avgSessionDurationSec = sessionEnds.length > 0
      ? Math.round(sessionEnds.reduce((sum, e) => sum + (e.data?.durationSec || 0), 0) / sessionEnds.length)
      : 0

    // Feature usage
    const featureUsage: Record<string, number> = {}
    for (const e of events.filter(e => e.type === 'feature_use')) {
      const feat = e.data?.feature || 'unknown'
      featureUsage[feat] = (featureUsage[feat] || 0) + 1
    }

    // Analysis types (from queries)
    const analysisTypes: Record<string, number> = {}
    for (const e of events.filter(e => e.type === 'query')) {
      const t = e.data?.analysisType || 'unknown'
      analysisTypes[t] = (analysisTypes[t] || 0) + 1
    }

    // Mode switches
    const modeSwitches: Record<string, number> = {}
    for (const e of events.filter(e => e.type === 'mode_switch')) {
      const to = e.data?.toMode || 'unknown'
      modeSwitches[to] = (modeSwitches[to] || 0) + 1
    }

    // Frameworks used
    const frameworksUsed: Record<string, number> = {}
    for (const e of events.filter(e => e.type === 'framework_select')) {
      const name = e.data?.frameworkName || e.data?.frameworkId || 'unknown'
      frameworksUsed[name] = (frameworksUsed[name] || 0) + 1
    }

    // Exports
    const exports: Record<string, number> = {}
    for (const e of events.filter(e => e.type === 'export')) {
      const fmt = e.data?.format || 'unknown'
      exports[fmt] = (exports[fmt] || 0) + 1
    }

    // Shares
    const shares: Record<string, number> = {}
    for (const e of events.filter(e => e.type === 'share')) {
      const ch = e.data?.channel || 'unknown'
      shares[ch] = (shares[ch] || 0) + 1
    }

    return NextResponse.json({
      overview: {
        totalVisits: visits.length,
        uniqueVisitors: sessions.size,
        repeatVisitors: repeatSessions,
        repeatVisitorRate: sessions.size > 0
          ? ((repeatSessions / sessions.size) * 100).toFixed(1)
          : '0',
        visitsLast24h,
        visitsLast7days,
        avgSessionDurationSec,
      },
      queryCategories: analysisTypes,
      featureUsage,
      analysisTypes,
      modeSwitches,
      frameworksUsed,
      exports,
      shares,
      privacyNote:
        'Analytics are aggregated locally. No individual queries are stored or displayed.',
    })
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json(emptyStats)
    }
    console.error('Analytics stats error:', error)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
