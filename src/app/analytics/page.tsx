'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Activity, Eye, Repeat, Clock, Download, Share2, LayoutGrid, ArrowRightLeft } from 'lucide-react'
import Link from 'next/link'

interface Stats {
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
  privacyNote: string
}

const defaultStats: Stats = {
  overview: {
    totalVisits: 0, uniqueVisitors: 0, repeatVisitors: 0, repeatVisitorRate: '0',
    visitsLast24h: 0, visitsLast7days: 0, avgSessionDurationSec: 0,
  },
  featureUsage: {}, analysisTypes: {}, modeSwitches: {},
  frameworksUsed: {}, exports: {}, shares: {},
  privacyNote: 'Analytics are aggregated locally. No individual queries are stored or displayed.',
}

function formatDuration(sec: number): string {
  if (sec === 0) return '-'
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}

function BarSection({ title, icon, data, color }: { title: string; icon: React.ReactNode; data: Record<string, number>; color: string }) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a)
  const max = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 1

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h2>
      {entries.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-6 text-sm">No data yet</p>
      ) : (
        <div className="space-y-3">
          {entries.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300 text-sm font-medium capitalize truncate mr-3">
                {label}
              </span>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-28 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`${color} h-2 rounded-full`}
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <span className="text-gray-900 dark:text-white font-semibold min-w-[2.5rem] text-right text-sm">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats>(defaultStats)

  useEffect(() => {
    fetch('/api/analytics/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <BarChart3 size={32} className="text-blue-600" />
              Claudeswitz Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Usage insights and metrics
            </p>
          </div>
          <Link href="/">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
              Back to App
            </button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Visits</h3>
              <Eye size={16} className="text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.totalVisits}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.overview.visitsLast7days} last 7d
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Unique</h3>
              <Users size={16} className="text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.uniqueVisitors}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distinct sessions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Repeat</h3>
              <Repeat size={16} className="text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.repeatVisitors}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.overview.repeatVisitorRate}% return</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">24h</h3>
              <Activity size={16} className="text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overview.visitsLast24h}</div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 24 hours</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Avg Session</h3>
              <Clock size={16} className="text-teal-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDuration(stats.overview.avgSessionDurationSec)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Duration</p>
          </div>
        </div>

        {/* Feature & Analysis breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarSection
            title="Feature Usage"
            icon={<BarChart3 size={20} className="text-blue-600" />}
            data={stats.featureUsage}
            color="bg-blue-600"
          />
          <BarSection
            title="Analysis Types"
            icon={<Activity size={20} className="text-green-600" />}
            data={stats.analysisTypes}
            color="bg-green-600"
          />
        </div>

        {/* Mode switches, frameworks, exports, shares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <BarSection
            title="Mode Switches"
            icon={<ArrowRightLeft size={18} className="text-indigo-600" />}
            data={stats.modeSwitches}
            color="bg-indigo-600"
          />
          <BarSection
            title="Frameworks Used"
            icon={<LayoutGrid size={18} className="text-teal-600" />}
            data={stats.frameworksUsed}
            color="bg-teal-600"
          />
          <BarSection
            title="Exports"
            icon={<Download size={18} className="text-amber-600" />}
            data={stats.exports}
            color="bg-amber-600"
          />
          <BarSection
            title="Shares"
            icon={<Share2 size={18} className="text-rose-600" />}
            data={stats.shares}
            color="bg-rose-600"
          />
        </div>

        {/* Privacy Notice */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
            Privacy & Data Handling
          </h3>
          <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
            <li>- Individual queries are never shown, only aggregated categories</li>
            <li>- Session IDs are randomly generated and not tied to user identity</li>
            <li>- All data is stored locally and not transmitted externally</li>
            <li>- Analytics can be reset at any time by deleting analytics-events.jsonl</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
