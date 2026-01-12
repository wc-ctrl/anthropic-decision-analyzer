'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronLeft, GitBranch, TrendingUp, Target, Map, Zap, BookOpen, CheckCircle2 } from 'lucide-react'

type ModeType = 'decision' | 'forecast' | 'scenario' | 'strategy'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
  tips: string[]
}

interface OnboardingModalProps {
  mode: ModeType
  isOpen: boolean
  onClose: () => void
  onSkipAll: () => void
}

const modeOnboarding: Record<ModeType, { title: string; icon: React.ReactNode; color: string; steps: OnboardingStep[] }> = {
  decision: {
    title: 'Decision Analysis',
    icon: <GitBranch size={24} />,
    color: 'blue',
    steps: [
      {
        title: 'What is Decision Analysis?',
        description: 'Decision Analysis helps you explore the consequences of choices. Enter a decision and the AI will generate a tree of first-order and second-order consequences, helping you see the full impact of your choices.',
        icon: <BookOpen size={40} className="text-blue-500" />,
        tips: [
          'Great for strategic decisions with unclear outcomes',
          'Works well for "What if we..." questions',
          'Helps identify blind spots in your thinking'
        ]
      },
      {
        title: 'How to Use It',
        description: 'Enter your decision in the input field. You can analyze multiple decisions at once by separating them with commas. The AI will generate a visual tree showing potential consequences at multiple levels.',
        icon: <Zap size={40} className="text-blue-500" />,
        tips: [
          'Be specific: "Launch product in Q2" beats "Launch product"',
          'Use commas to analyze related decisions together',
          'Click nodes to edit, drill down, or get more details'
        ]
      },
      {
        title: 'Advanced Features',
        description: 'Use the toolbar buttons to enhance your analysis: Devil\'s Advocate challenges your assumptions, Steelman finds the strongest case, and Get Weird explores unconventional scenarios.',
        icon: <CheckCircle2 size={40} className="text-blue-500" />,
        tips: [
          'Add more layers with the "Deep Layer" button',
          'Export to PowerPoint or Word for presentations',
          'Connect Slack or Google Drive for context-aware analysis'
        ]
      }
    ]
  },
  forecast: {
    title: 'Causal Analysis',
    icon: <TrendingUp size={24} />,
    color: 'green',
    steps: [
      {
        title: 'What is Causal Analysis?',
        description: 'Causal Analysis works backwards from an outcome to explore what could cause it. Enter a future state or outcome, and the AI will map the causal pathways that could lead to it.',
        icon: <BookOpen size={40} className="text-green-500" />,
        tips: [
          'Perfect for understanding "Why might X happen?"',
          'Helps identify leading indicators to watch',
          'Reveals hidden dependencies and root causes'
        ]
      },
      {
        title: 'How to Use It',
        description: 'Enter an outcome or future state you want to analyze. The tree flows from causes toward your outcome, showing how different factors combine to produce results.',
        icon: <Zap size={40} className="text-green-500" />,
        tips: [
          'Frame as outcomes: "Market share drops 20%"',
          'Analyze multiple outcomes with commas',
          'Look for shared root causes across branches'
        ]
      },
      {
        title: 'Reading the Tree',
        description: 'Unlike Decision Analysis where consequences flow down from decisions, Causal Analysis shows causes pointing toward the outcome. Colors indicate positive (green) or negative (red) contributing factors.',
        icon: <CheckCircle2 size={40} className="text-green-500" />,
        tips: [
          'Green edges = factors that enable the outcome',
          'Follow chains to find actionable intervention points',
          'Use Wargaming to stress-test your causal model'
        ]
      }
    ]
  },
  scenario: {
    title: 'Scenario Analysis',
    icon: <Target size={24} />,
    color: 'purple',
    steps: [
      {
        title: 'What is Scenario Analysis?',
        description: 'Scenario Analysis generates a probability-tiered view of possible futures. Enter a target outcome and get a structured breakdown from "Maximally Likely" to "Maximally Unlikely" scenarios.',
        icon: <BookOpen size={40} className="text-purple-500" />,
        tips: [
          'Best for strategic planning and risk assessment',
          'Helps prepare for multiple futures',
          'Identifies early warning signposts to monitor'
        ]
      },
      {
        title: 'How to Use It',
        description: 'Enter your target outcome or situation. The AI generates six probability tracks, each with specific signposts - observable events that would indicate you\'re heading toward that scenario.',
        icon: <Zap size={40} className="text-purple-500" />,
        tips: [
          'Be specific about the outcome and timeframe',
          'Each track shows what to watch for',
          'Signposts are concrete, observable events'
        ]
      },
      {
        title: 'Using the Results',
        description: 'The probability tracks aren\'t predictions - they\'re mental models for preparation. Use signposts as early warning indicators and build contingency plans for different tracks.',
        icon: <CheckCircle2 size={40} className="text-purple-500" />,
        tips: [
          'Monitor signposts to detect which track you\'re on',
          'Build response plans for high-impact scenarios',
          'Revisit analysis as signposts materialize'
        ]
      }
    ]
  },
  strategy: {
    title: 'Strategy Mode',
    icon: <Map size={24} />,
    color: 'orange',
    steps: [
      {
        title: 'What is Strategy Mode?',
        description: 'Strategy Mode applies a rigorous Ends-Ways-Means-Risk framework to your strategic goals. It decomposes your strategy into components and stress-tests each element.',
        icon: <BookOpen size={40} className="text-orange-500" />,
        tips: [
          'Based on proven strategic planning frameworks',
          'Identifies gaps between goals and resources',
          'Surfaces hidden assumptions and risks'
        ]
      },
      {
        title: 'How to Use It',
        description: 'Enter your strategic goal or initiative. The AI will analyze it across five dimensions: Ends (objectives), Ways (approaches), Means (resources), Risks, and Critical Assumptions.',
        icon: <Zap size={40} className="text-orange-500" />,
        tips: [
          'Enter high-level goals: "Become market leader in AI safety"',
          'Works for organizational and personal strategy',
          'Multiple goals analyzed for consistency'
        ]
      },
      {
        title: 'Understanding the Framework',
        description: 'Each section provides structured analysis: Ends evaluates objective clarity and achievability, Ways examines approaches and alternatives, Means assesses resource sufficiency, Risks identifies threats, and Assumptions surfaces what you\'re taking for granted.',
        icon: <CheckCircle2 size={40} className="text-orange-500" />,
        tips: [
          'Pay special attention to the Integration section',
          'Look for gaps between ends and means',
          'Check if assumptions are testable and monitored'
        ]
      }
    ]
  }
}

export function OnboardingModal({ mode, isOpen, onClose, onSkipAll }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const config = modeOnboarding[mode]
  const totalSteps = config.steps.length

  // Reset to first step when modal opens with new mode
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen, mode])

  if (!isOpen) return null

  const currentStepData = config.steps[currentStep]
  const isLastStep = currentStep === totalSteps - 1

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      dot: 'bg-blue-600',
      dotInactive: 'bg-blue-200 dark:bg-blue-800'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      button: 'bg-green-600 hover:bg-green-700',
      dot: 'bg-green-600',
      dotInactive: 'bg-green-200 dark:bg-green-800'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700',
      dot: 'bg-purple-600',
      dotInactive: 'bg-purple-200 dark:bg-purple-800'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-600 dark:text-orange-400',
      button: 'bg-orange-600 hover:bg-orange-700',
      dot: 'bg-orange-600',
      dotInactive: 'bg-orange-200 dark:bg-orange-800'
    }
  }

  const colors = colorClasses[config.color as keyof typeof colorClasses]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden ${colors.border} border-2`}>
        {/* Header */}
        <div className={`${colors.bg} px-6 py-4 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={colors.text}>
              {config.icon}
            </div>
            <div>
              <h2 className={`text-lg font-semibold ${colors.text}`}>
                Welcome to {config.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep + 1} of {totalSteps}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">
              {currentStepData.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-lg">
              {currentStepData.description}
            </p>
          </div>

          {/* Tips */}
          <div className={`${colors.bg} rounded-xl p-4`}>
            <p className={`text-sm font-medium ${colors.text} mb-2`}>Tips:</p>
            <ul className="space-y-2">
              {currentStepData.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className={`${colors.text} mt-0.5`}>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pb-4">
          {config.steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                index === currentStep ? colors.dot : colors.dotInactive
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
          <button
            onClick={onSkipAll}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Skip all tutorials
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
                Back
              </button>
            )}

            {isLastStep ? (
              <button
                onClick={onClose}
                className={`flex items-center gap-2 px-6 py-2 ${colors.button} text-white rounded-lg transition-colors font-medium`}
              >
                Get Started
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className={`flex items-center gap-2 px-6 py-2 ${colors.button} text-white rounded-lg transition-colors font-medium`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
