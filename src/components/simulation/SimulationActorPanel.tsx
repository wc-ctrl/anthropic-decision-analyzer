'use client'

import React from 'react'
import { Actor } from '@/types/simulation'
import { User, Building, Users, Globe, Sparkles, TrendingUp, TrendingDown, Minus, Heart, Swords } from 'lucide-react'

interface SimulationActorPanelProps {
  actors: Actor[]
  selectedActorId?: string
  onSelectActor?: (actorId: string) => void
}

const getActorIcon = (type: Actor['type']) => {
  switch (type) {
    case 'individual': return <User size={16} />
    case 'organization': return <Building size={16} />
    case 'government': return <Globe size={16} />
    case 'group': return <Users size={16} />
    case 'abstract': return <Sparkles size={16} />
  }
}

const getStateColor = (state: Actor['currentState']) => {
  switch (state) {
    case 'active': return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    case 'strengthened': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
    case 'weakened': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    case 'eliminated': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
}

const getRelationshipIcon = (type: string) => {
  switch (type) {
    case 'ally': return <Heart size={12} className="text-green-500" />
    case 'adversary':
    case 'rival': return <Swords size={12} className="text-red-500" />
    default: return <Minus size={12} className="text-gray-400" />
  }
}

export function SimulationActorPanel({ actors, selectedActorId, onSelectActor }: SimulationActorPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
        <Users size={16} />
        Actors ({actors.length})
      </h3>

      {actors.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center">
          No actors identified yet
        </p>
      ) : (
        <div className="space-y-2">
          {actors.map((actor) => (
            <div
              key={actor.id}
              onClick={() => onSelectActor?.(actor.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                selectedActorId === actor.id
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Actor Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-gray-400">
                    {getActorIcon(actor.type)}
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">
                    {actor.name}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded ${getStateColor(actor.currentState)}`}>
                  {actor.currentState}
                </span>
              </div>

              {/* Goals */}
              {actor.goals.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Goals:</p>
                  <div className="flex flex-wrap gap-1">
                    {actor.goals.slice(0, 2).map((goal, i) => (
                      <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                        {goal.length > 25 ? goal.substring(0, 25) + '...' : goal}
                      </span>
                    ))}
                    {actor.goals.length > 2 && (
                      <span className="text-xs text-gray-400">+{actor.goals.length - 2}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Resources:</span>
                  <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${actor.resources}%` }}
                    />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{actor.resources}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400">Influence:</span>
                  <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${actor.influence}%` }}
                    />
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{actor.influence}</span>
                </div>
              </div>

              {/* Relationships */}
              {actor.relationships.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {actor.relationships.slice(0, 3).map((rel, i) => {
                      const targetActor = actors.find(a => a.id === rel.targetActorId)
                      if (!targetActor) return null
                      return (
                        <span key={i} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          {getRelationshipIcon(rel.type)}
                          {targetActor.name.split(' ')[0]}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
