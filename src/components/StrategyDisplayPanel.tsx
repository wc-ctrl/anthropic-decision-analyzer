'use client'

import React from 'react'
import { Map, Target, Compass, Shield, Brain, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
import { StrategyFramework } from '@/types/decision'

interface StrategyDisplayPanelProps {
  data: StrategyFramework | null
  loading: boolean
}

export function StrategyDisplayPanel({ data, loading }: StrategyDisplayPanelProps) {
  const getRiskColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getAchievabilityIcon = (achievability: string) => {
    switch (achievability) {
      case 'appropriate': return <CheckCircle size={16} className="text-green-500" />
      case 'over-scoped': return <XCircle size={16} className="text-red-500" />
      case 'under-scoped': return <AlertTriangle size={16} className="text-yellow-500" />
      default: return <AlertTriangle size={16} className="text-gray-500" />
    }
  }

  const getFragilityColor = (fragility: string) => {
    switch (fragility) {
      case 'robust': return 'text-green-600 dark:text-green-400'
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400'
      case 'fragile': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Developing comprehensive strategy...
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            Applying Ends-Ways-Means framework
          </p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Map size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Set a strategic objective to develop comprehensive strategy
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="strategy-display-panel h-full overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
      {/* Strategic Objective Header */}
      <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-2">
          <Map size={24} className="text-orange-600 dark:text-orange-400" />
          <h2 className="text-xl font-semibold text-orange-900 dark:text-orange-100">
            Strategic Framework
          </h2>
        </div>
        <p className="text-orange-800 dark:text-orange-200 text-lg font-medium">
          {data.strategicObjective}
        </p>
      </div>

      {/* Framework Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* ENDS */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-center gap-2">
              <Target size={20} className="text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">ENDS</h3>
              <span className="text-sm text-blue-700 dark:text-blue-300">(Objectives)</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {/* Objectives */}
            {data.ends.objectives.map((obj, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{obj.objective}</h4>
                  {getAchievabilityIcon(obj.achievability)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{obj.specificity}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Timeline:</strong> {obj.timeframe} | <strong>Scope:</strong> {obj.achievability}
                </div>
                <div className="mt-2">
                  <strong className="text-xs text-gray-600 dark:text-gray-400">Metrics:</strong>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {obj.metrics.map((metric, i) => (
                      <li key={i}>• {metric}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {/* Additional Ends Analysis */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3">
              <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Strategic Analysis:</h5>
              <div className="space-y-2 text-sm">
                <p><strong>Consistency:</strong> {data.ends.internalConsistency}</p>
                {data.ends.hiddenObjectives.length > 0 && (
                  <p><strong>Hidden Goals:</strong> {data.ends.hiddenObjectives.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* WAYS */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/10">
            <div className="flex items-center gap-2">
              <Compass size={20} className="text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">WAYS</h3>
              <span className="text-sm text-green-700 dark:text-green-300">(Methods)</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {data.ways.approaches.map((approach, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{approach.approach}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{approach.causalLogic}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-1 rounded ${approach.executionRisk === 'high' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' : approach.executionRisk === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' : 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'}`}>
                    {approach.executionRisk} risk
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {approach.resourceIntensity} resources
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                    {approach.novelty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MEANS */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/10">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-yellow-600 dark:text-yellow-400" />
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">MEANS</h3>
              <span className="text-sm text-yellow-700 dark:text-yellow-300">(Resources)</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {data.means.resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">{resource.resource}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Sufficiency:</strong> {resource.sufficiency}</div>
                  <div><strong>Readiness:</strong> {resource.readiness}</div>
                  <div><strong>Flexibility:</strong> {resource.fungibility}</div>
                  <div><strong>Dependencies:</strong> {resource.dependencies.length}</div>
                </div>
              </div>
            ))}

            {data.means.capabilityGaps.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Critical Gaps:</h5>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                  {data.means.capabilityGaps.map((gap, i) => (
                    <li key={i}>• {gap}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* RISKS */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-red-50 dark:bg-red-900/10">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">RISKS</h3>
              <span className="text-sm text-red-700 dark:text-red-300">(Threats)</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {data.risks.riskFactors.map((risk, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{risk.risk}</h4>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {risk.probability}%
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getRiskColor(risk.impact)}`}>
                      {risk.impact}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{risk.mitigation}</p>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Early Warning:</strong> {risk.earlyWarning.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Integration Analysis */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/10">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-purple-600 dark:text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">INTEGRATION</h3>
            <span className="text-sm text-purple-700 dark:text-purple-300">(Synthesis)</span>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Theory of Victory */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Theory of Victory</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-purple-50 dark:bg-purple-900/10 p-3 rounded">
                {data.integration.theoryOfVictory}
              </p>
            </div>

            {/* Critical Path */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Critical Path</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded">
                {data.integration.criticalPath}
              </p>
            </div>
          </div>

          {/* Top Vulnerabilities */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Top Strategic Vulnerabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.integration.topVulnerabilities.map((vulnerability, index) => (
                <div key={index} className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold text-sm">#{index + 1}</span>
                    <p className="text-sm text-red-800 dark:text-red-200">{vulnerability}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stress Test Scenarios */}
          {data.integration.stressTestScenarios.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Stress Test Scenarios</h4>
              <div className="space-y-2">
                {data.integration.stressTestScenarios.map((scenario, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded p-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{scenario}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assumptions Panel */}
      {data.assumptions.criticalAssumptions.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Critical Assumptions</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {data.assumptions.criticalAssumptions.map((assumption, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{assumption.assumption}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${getFragilityColor(assumption.fragility)}`}>
                      {assumption.fragility}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <strong>Testability:</strong> {assumption.testability} | <strong>Monitoring:</strong> {assumption.monitoring.join(', ')}
                  </div>
                </div>
              ))}
            </div>

            {data.assumptions.vulnerabilities && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <h5 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Greatest Vulnerability:</h5>
                <p className="text-sm text-red-800 dark:text-red-200">{data.assumptions.vulnerabilities}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}