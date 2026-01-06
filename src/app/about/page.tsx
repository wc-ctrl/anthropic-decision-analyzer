'use client'

import React from 'react'
import Link from 'next/link'
import { Info, MessageSquare, User, ArrowLeft, Sparkles } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8"
        >
          <ArrowLeft size={16} />
          Back to Claudeswitz
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={32} className="text-amber-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Claudeswitz
            </h1>
            <span className="px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
              v1.3
            </span>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            AI-powered decision analysis for strategic planning
          </p>
        </div>

        {/* About section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <Info size={20} className="text-blue-500 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">About</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Claudeswitz is a decision analysis tool that helps you explore the consequences
                of strategic decisions. It uses AI to generate decision trees, identify risks
                and opportunities, and provide structured analysis for complex choices.
              </p>
            </div>
          </div>
        </div>

        {/* Maintained by */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-start gap-3">
            <User size={20} className="text-green-500 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Maintained by</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                <span className="font-medium text-gray-900 dark:text-white">Mission Labs</span>
              </p>
            </div>
          </div>
        </div>

        {/* Feedback section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start gap-3">
            <MessageSquare size={20} className="text-purple-500 mt-0.5" />
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
                We welcome your feedback and suggestions!
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400">#</span>
                  <span>Slack channel: </span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-blue-600 dark:text-blue-400">
                    #temp-p-claudeswitz
                  </code>
                </li>
                <li className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span className="text-gray-400">@</span>
                  <span>Creator: </span>
                  <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-blue-600 dark:text-blue-400">
                    @wc
                  </code>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
          Built with Claude
        </p>
      </div>
    </div>
  )
}
