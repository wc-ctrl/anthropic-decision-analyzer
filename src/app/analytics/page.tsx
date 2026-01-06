'use client'

import React, { useState, useEffect } from 'react'
import { BarChart3, Users, TrendingUp, Activity, RefreshCw, Eye, Repeat } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsStats {
  overview: {
    totalVisits: number
    uniqueVisitors: number
    repeatVisitors: number
    repeatVisitorRate: string
    visitsLast24h: number
    visitsLast7days: number
  }
  queryCategories: Record<string, { count: number; examples: string[] }>
  featureUsage: Record<string, number>
  analysisTypes: Record<string, number>
  privacyNote: string
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/analytics/stats`)
      if (!response.ok) {
        throw new Error('Failed to load analytics')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              <BarChart3 size={32} className="text-blue-600" />
              Claudeswitz v1.3 Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Usage insights and metrics (privacy-preserving)
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <Link href="/">
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Back to App
              </button>
            </Link>
          </div>
        </div>
      </div>

      {stats && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Visits</h3>
                <Eye size={20} className="text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.totalVisits}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Unique Visitors</h3>
                <Users size={20} className="text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.uniqueVisitors}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Distinct sessions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Repeat Visitors</h3>
                <Repeat size={20} className="text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.repeatVisitors}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.overview.repeatVisitorRate}% return rate
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</h3>
                <Activity size={20} className="text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.overview.visitsLast24h}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Last 24 hours ({stats.overview.visitsLast7days} in 7 days)
              </p>
            </div>
          </div>

          {/* Query Categories */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-blue-600" />
              Query Topics by Category
            </h2>
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Privacy Note:</strong> {stats.privacyNote}
              </p>
            </div>
            {Object.keys(stats.queryCategories).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No categories with 5+ queries yet. Categories will appear as usage grows to preserve privacy.
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(stats.queryCategories)
                  .sort(([, a], [, b]) => b.count - a.count)
                  .map(([category, data]) => (
                    <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                          {data.count} queries
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-1">Example queries:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {data.examples.map((example, idx) => (
                            <li key={idx} className="truncate">{example}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Feature Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Feature Usage
              </h2>
              {Object.keys(stats.featureUsage).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No feature usage data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.featureUsage)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([feature, count]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {feature}
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (count as number / Math.max(...Object.values(stats.featureUsage) as number[])) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-900 dark:text-white font-semibold min-w-[3rem] text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Analysis Types
              </h2>
              {Object.keys(stats.analysisTypes).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No analysis data yet
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(stats.analysisTypes)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                          {type} Mode
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(100, (count as number / Math.max(...Object.values(stats.analysisTypes) as number[])) * 100)}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-900 dark:text-white font-semibold min-w-[3rem] text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
              Privacy & Data Handling
            </h3>
            <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
              <li>• Query topics are only displayed when a category has 5+ queries</li>
              <li>• Individual queries are never shown, only aggregated categories</li>
              <li>• Session IDs are randomly generated and not tied to user identity</li>
              <li>• All data is stored locally and not transmitted externally</li>
              <li>• Analytics can be reset at any time by deleting analytics-data.json</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
