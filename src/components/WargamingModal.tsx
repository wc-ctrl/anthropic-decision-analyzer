'use client'

import React, { useState } from 'react'
import { X, Swords, Send, User, Bot, RefreshCw, Users, Target } from 'lucide-react'

interface Actor {
  name: string
  role: string
  interests: string[]
  constraints: string[]
  initialPosition: string
}

interface WargameMessage {
  id: string
  type: 'user' | 'actor' | 'system'
  content: string
  timestamp: string
  actorName?: string
}

interface WargamingModalProps {
  isOpen: boolean
  onClose: () => void
  actors: Actor[]
  analysisContext: string
  analysisType: 'decision' | 'forecast' | 'scenario' | 'strategy'
  loading: boolean
}

export function WargamingModal({
  isOpen,
  onClose,
  actors,
  analysisContext,
  analysisType,
  loading
}: WargamingModalProps) {
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null)
  const [messages, setMessages] = useState<WargameMessage[]>([])
  const [userInput, setUserInput] = useState('')
  const [isSimulating, setIsSimulating] = useState(false)

  const handleSelectActor = (actor: Actor) => {
    setSelectedActor(actor)
    setMessages([{
      id: `system-${Date.now()}`,
      type: 'system',
      content: `Wargaming as **${actor.name}** (${actor.role}). You can now interact with this actor to explore how they would respond to different scenarios and actions.`,
      timestamp: new Date().toISOString()
    }])
  }

  const handleSendAction = async () => {
    if (!userInput.trim() || !selectedActor) return

    const userMessage: WargameMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setUserInput('')
    setIsSimulating(true)

    try {
      // Call wargaming simulation API
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/wargaming/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: selectedActor,
          userAction: userInput.trim(),
          conversationHistory: messages,
          analysisContext: analysisContext,
          analysisType: analysisType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to simulate actor response')
      }

      const data = await response.json()

      const actorMessage: WargameMessage = {
        id: `actor-${Date.now()}`,
        type: 'actor',
        content: data.response,
        timestamp: new Date().toISOString(),
        actorName: selectedActor.name
      }

      setMessages(prev => [...prev, actorMessage])

    } catch (error) {
      console.error('Error in wargaming simulation:', error)
      const errorMessage: WargameMessage = {
        id: `error-${Date.now()}`,
        type: 'system',
        content: 'Error: Unable to simulate actor response. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsSimulating(false)
    }
  }

  const handleReset = () => {
    setMessages([])
    setUserInput('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-indigo-50 dark:bg-indigo-900/20">
          <div className="flex items-center gap-3">
            <Swords size={24} className="text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Wargaming Simulation
              </h2>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                Interactive actor-based scenario exploration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">
                Identifying actors and initializing wargame...
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Actor Selection Sidebar */}
            <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  Select Actor
                </h3>
                <div className="space-y-2">
                  {actors.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No actors identified in this analysis
                    </p>
                  ) : (
                    actors.map((actor, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectActor(actor)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedActor?.name === actor.name
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <User size={16} className="text-indigo-600 dark:text-indigo-400 mt-1 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                              {actor.name}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {actor.role}
                            </div>
                            <div className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                              {actor.interests.slice(0, 2).join(', ')}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {selectedActor && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-indigo-200 dark:border-indigo-700">
                    <h4 className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-2">
                      Actor Profile
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Interests:</span>
                        <ul className="mt-1 space-y-1">
                          {selectedActor.interests.map((interest, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-400">• {interest}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Constraints:</span>
                        <ul className="mt-1 space-y-1">
                          {selectedActor.constraints.map((constraint, idx) => (
                            <li key={idx} className="text-gray-600 dark:text-gray-400">• {constraint}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Position:</span>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">
                          {selectedActor.initialPosition}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Wargaming Interface */}
            <div className="flex-1 flex flex-col">
              {!selectedActor ? (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <Target size={64} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Select an Actor to Begin Wargaming
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md">
                      Choose an actor from the sidebar to start an interactive simulation.
                      You can explore how they respond to different actions and decisions.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Conversation Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.type === 'actor'
                              ? 'bg-indigo-100 dark:bg-indigo-900/30 text-gray-900 dark:text-gray-100'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-center'
                          }`}
                        >
                          {message.type === 'actor' && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-200 dark:border-indigo-700">
                              <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
                              <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-100">
                                {message.actorName}
                              </span>
                            </div>
                          )}
                          {message.type === 'user' && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-blue-400">
                              <User size={16} />
                              <span className="font-semibold text-sm">You</span>
                            </div>
                          )}
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={handleReset}
                        disabled={isSimulating || messages.length === 0}
                        className="px-3 py-1.5 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded disabled:bg-gray-300 dark:disabled:bg-gray-700 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw size={14} />
                        Reset
                      </button>
                      <div className="flex-1 text-xs text-gray-600 dark:text-gray-400">
                        Simulating as: <span className="font-semibold text-indigo-700 dark:text-indigo-300">{selectedActor.name}</span>
                      </div>
                    </div>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        handleSendAction()
                      }}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder={`What action do you take? (e.g., "Offer 20% discount", "Form strategic alliance")`}
                        disabled={isSimulating}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800"
                      />
                      <button
                        type="submit"
                        disabled={!userInput.trim() || isSimulating}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {isSimulating ? (
                          <>
                            <Bot size={16} className="animate-pulse" />
                            Simulating...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Simulate
                          </>
                        )}
                      </button>
                    </form>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Describe an action or decision, and see how {selectedActor?.name} would respond based on their interests and constraints.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-indigo-700 dark:text-indigo-300">Wargaming Mode:</strong> Interactive actor simulation for strategic exploration
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
