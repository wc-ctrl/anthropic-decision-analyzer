'use client'

import React from 'react'
import { RecommendedStep, Actor } from '@/types/simulation'
import { Lightbulb, AlertCircle, ArrowRight, MessageSquare } from 'lucide-react'

interface SimulationRecommendationsProps {
  recommendations: RecommendedStep[]
  actors: Actor[]
  userGuidance: string
  onGuidanceChange: (guidance: string) => void
}

const getRiskColor = (risk: RecommendedStep['riskLevel']) => {
  switch (risk) {
    case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
}

const getUrgencyColor = (urgency: RecommendedStep['urgency']) => {
  switch (urgency) {
    case 'low': return 'text-gray-500 dark:text-gray-400'
    case 'medium': return 'text-yellow-600 dark:text-yellow-400'
    case 'high': return 'text-red-600 dark:text-red-400'
  }
}

export function SimulationRecommendations({
  recommendations,
  actors,
  userGuidance,
  onGuidanceChange
}: SimulationRecommendationsProps) {
  const getActorName = (actorId: string) => {
    const actor = actors.find(a => a.id === actorId)
    return actor?.name || actorId
  }

  return (
    <div className="space-y-4">
      {/* User Guidance Input */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2 mb-2">
          <MessageSquare size={16} />
          Your Guidance
        </h3>
        <textarea
          value={userGuidance}
          onChange={(e) => onGuidanceChange(e.target.value)}
          placeholder="Provide guidance to influence the next round (e.g., 'Actor A should focus on defense', 'Prioritize negotiation over conflict')"
          className="w-full h-20 p-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your input influences how actors behave in the next simulation step
        </p>
      </div>

      {/* AI Recommendations */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-emerald-500" />
          AI Recommendations
        </h3>

        {recommendations.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            Run a simulation step to get recommendations
          </p>
        ) : (
          <div className="space-y-2">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      {getActorName(rec.targetActor)}
                    </span>
                    <ArrowRight size={12} className="text-gray-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 text-sm capitalize">
                      {rec.suggestedAction.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${getRiskColor(rec.riskLevel)}`}>
                      {rec.riskLevel} risk
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {rec.reasoning}
                </p>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Expected: {rec.expectedImpact}
                  </span>
                  <span className={`flex items-center gap-1 ${getUrgencyColor(rec.urgency)}`}>
                    <AlertCircle size={12} />
                    {rec.urgency} urgency
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
