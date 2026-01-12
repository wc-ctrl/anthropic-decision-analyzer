'use client'

import React from 'react'
import { KeyMoment, Actor } from '@/types/simulation'
import { AlertTriangle, Zap, Users, Swords, TrendingUp, UserX, Target, HelpCircle, Play } from 'lucide-react'

interface SimulationKeyMomentAlertProps {
  moment: KeyMoment
  actors: Actor[]
  onContinue: () => void
  onPause: () => void
}

const getMomentIcon = (type: KeyMoment['type']) => {
  switch (type) {
    case 'major_shift': return <TrendingUp size={24} className="text-purple-500" />
    case 'conflict_peak': return <Swords size={24} className="text-red-500" />
    case 'alliance_formed': return <Users size={24} className="text-green-500" />
    case 'alliance_broken': return <UserX size={24} className="text-orange-500" />
    case 'inflection_point': return <Zap size={24} className="text-yellow-500" />
    case 'cascade_risk': return <AlertTriangle size={24} className="text-red-500" />
    case 'actor_eliminated': return <UserX size={24} className="text-gray-500" />
    case 'goal_achieved': return <Target size={24} className="text-green-500" />
    default: return <HelpCircle size={24} className="text-blue-500" />
  }
}

const getMomentTitle = (type: KeyMoment['type']) => {
  switch (type) {
    case 'major_shift': return 'Major Power Shift'
    case 'conflict_peak': return 'Conflict Escalation'
    case 'alliance_formed': return 'New Alliance Formed'
    case 'alliance_broken': return 'Alliance Broken'
    case 'inflection_point': return 'Critical Decision Point'
    case 'cascade_risk': return 'Cascade Risk Detected'
    case 'actor_eliminated': return 'Actor Eliminated'
    case 'goal_achieved': return 'Goal Achieved'
    default: return 'Key Moment'
  }
}

const getSignificanceColor = (significance: KeyMoment['significance']) => {
  switch (significance) {
    case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
    case 'major': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800'
    case 'moderate': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
    case 'minor': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  }
}

export function SimulationKeyMomentAlert({ moment, actors, onContinue, onPause }: SimulationKeyMomentAlertProps) {
  const getActorName = (actorId: string) => {
    const actor = actors.find(a => a.id === actorId)
    return actor?.name || actorId
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[250] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-pulse-once">
        {/* Header */}
        <div className={`p-6 ${getSignificanceColor(moment.significance)} border-b`}>
          <div className="flex items-center gap-4">
            {getMomentIcon(moment.type)}
            <div>
              <h2 className="text-xl font-bold">
                {getMomentTitle(moment.type)}
              </h2>
              <p className="text-sm opacity-80">
                Round {moment.round} • {moment.significance.charAt(0).toUpperCase() + moment.significance.slice(1)} significance
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {moment.description}
          </p>

          {/* Involved Actors */}
          {moment.involvedActors.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actors Involved</h4>
              <div className="flex flex-wrap gap-2">
                {moment.involvedActors.map((actorId) => (
                  <span key={actorId} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm">
                    {getActorName(actorId)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Implications */}
          {moment.implications.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Implications</h4>
              <ul className="space-y-1">
                {moment.implications.map((implication, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-emerald-500 mt-1">•</span>
                    {implication}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onPause}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Stay Paused
          </button>
          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
          >
            <Play size={16} />
            Continue Simulation
          </button>
        </div>
      </div>
    </div>
  )
}
