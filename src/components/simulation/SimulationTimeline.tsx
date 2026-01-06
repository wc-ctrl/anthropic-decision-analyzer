'use client'

import React, { useState } from 'react'
import { RoundResult, Actor, KeyMoment } from '@/types/simulation'
import { ChevronDown, ChevronRight, AlertTriangle, Swords, ArrowRight, Zap, TrendingUp, TrendingDown } from 'lucide-react'

interface SimulationTimelineProps {
  rounds: RoundResult[]
  actors: Actor[]
  currentRound: number
  onSelectRound?: (roundNumber: number) => void
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'cooperate': return <TrendingUp size={12} className="text-green-500" />
    case 'compete':
    case 'attack': return <Swords size={12} className="text-red-500" />
    case 'negotiate': return <ArrowRight size={12} className="text-blue-500" />
    case 'defend': return <AlertTriangle size={12} className="text-yellow-500" />
    default: return <Zap size={12} className="text-gray-400" />
  }
}

const getEquilibriumColor = (status: RoundResult['equilibriumStatus']) => {
  switch (status) {
    case 'stable': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
    case 'unstable': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
    case 'shifting': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
    case 'volatile': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  }
}

const getMomentColor = (type: KeyMoment['type']) => {
  switch (type) {
    case 'major_shift':
    case 'inflection_point': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
    case 'conflict_peak':
    case 'cascade_risk': return 'border-red-500 bg-red-50 dark:bg-red-900/20'
    case 'alliance_formed': return 'border-green-500 bg-green-50 dark:bg-green-900/20'
    case 'alliance_broken': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
    case 'actor_eliminated': return 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
    default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
  }
}

export function SimulationTimeline({ rounds, actors, currentRound, onSelectRound }: SimulationTimelineProps) {
  const [expandedRounds, setExpandedRounds] = useState<Set<number>>(new Set([currentRound]))

  const toggleRound = (roundNumber: number) => {
    const newExpanded = new Set(expandedRounds)
    if (newExpanded.has(roundNumber)) {
      newExpanded.delete(roundNumber)
    } else {
      newExpanded.add(roundNumber)
    }
    setExpandedRounds(newExpanded)
  }

  const getActorName = (actorId: string) => {
    const actor = actors.find(a => a.id === actorId)
    return actor?.name || actorId
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
        Timeline (Round {currentRound}/{rounds.length > 0 ? rounds.length : '?'})
      </h3>

      {rounds.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic py-4 text-center">
          No rounds completed yet. Click &quot;Step&quot; to advance the simulation.
        </p>
      ) : (
        <div className="space-y-2">
          {rounds.map((round) => {
            const isExpanded = expandedRounds.has(round.round)
            const hasKeyMoments = round.keyMoments.length > 0
            const hasConflicts = round.conflicts.length > 0

            return (
              <div
                key={round.round}
                className={`border rounded-lg overflow-hidden ${
                  round.round === currentRound
                    ? 'border-emerald-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Round Header */}
                <button
                  onClick={() => toggleRound(round.round)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="font-medium text-gray-900 dark:text-white text-sm">
                      Round {round.round}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getEquilibriumColor(round.equilibriumStatus)}`}>
                      {round.equilibriumStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasKeyMoments && (
                      <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded">
                        Key moment
                      </span>
                    )}
                    {hasConflicts && (
                      <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">
                        {round.conflicts.length} conflict{round.conflicts.length > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {round.actions.length} actions
                    </span>
                  </div>
                </button>

                {/* Round Content */}
                {isExpanded && (
                  <div className="p-3 space-y-3 bg-white dark:bg-gray-800">
                    {/* Narrative Summary */}
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {round.narrativeSummary}
                    </p>

                    {/* Actions */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h4>
                      <div className="space-y-1">
                        {round.actions.map((action, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            {getActionIcon(action.actionType)}
                            <span className="font-medium text-gray-900 dark:text-white">
                              {getActorName(action.actorId)}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {action.actionType}
                              {action.targetActorId && ` → ${getActorName(action.targetActorId)}`}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">
                              (intensity: {action.intensity})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Conflicts */}
                    {hasConflicts && (
                      <div>
                        <h4 className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">Conflicts</h4>
                        <div className="space-y-2">
                          {round.conflicts.map((conflict) => (
                            <div key={conflict.id} className="p-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded text-xs">
                              <div className="flex items-center gap-2 mb-1">
                                <Swords size={12} className="text-red-500" />
                                <span className="font-medium text-red-900 dark:text-red-100">
                                  {conflict.actorIds.map(id => getActorName(id)).join(' vs ')}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded ${
                                  conflict.outcome === 'decisive' ? 'bg-red-200 dark:bg-red-800' :
                                  conflict.outcome === 'stalemate' ? 'bg-gray-200 dark:bg-gray-700' :
                                  'bg-yellow-200 dark:bg-yellow-800'
                                } text-gray-700 dark:text-gray-200`}>
                                  {conflict.outcome}
                                </span>
                              </div>
                              <p className="text-red-800 dark:text-red-200">{conflict.description}</p>
                              {conflict.resolution && (
                                <p className="text-red-600 dark:text-red-300 mt-1 italic">→ {conflict.resolution}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Moments */}
                    {hasKeyMoments && (
                      <div>
                        <h4 className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">Key Moments</h4>
                        <div className="space-y-2">
                          {round.keyMoments.map((moment) => (
                            <div key={moment.id} className={`p-2 border-l-2 rounded-r ${getMomentColor(moment.type)}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-purple-900 dark:text-purple-100 capitalize">
                                  {moment.type.replace(/_/g, ' ')}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  moment.significance === 'critical' ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100' :
                                  moment.significance === 'major' ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-100' :
                                  'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                }`}>
                                  {moment.significance}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 dark:text-gray-300">{moment.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* State Changes */}
                    {round.stateChanges.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">State Changes</h4>
                        <div className="flex flex-wrap gap-1">
                          {round.stateChanges.map((change, i) => (
                            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                              {getActorName(change.actorId)}: {change.field} {String(change.previousValue)} → {String(change.newValue)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
