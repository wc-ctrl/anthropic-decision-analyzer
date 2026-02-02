'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Loader2, CheckCircle, MessageSquare, LogOut, Plus, X, Hash, ChevronDown } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
}

interface SlackUser {
  slack_id: string
  slack_name: string
  human_name: string
  username: string
}

interface McpIntegrationPanelProps {
  onDataSourcesUpdated: (hasDocuments: boolean) => void
  onUploadClick: () => void
  slackEnabled: boolean
  onSlackToggle: (enabled: boolean) => void
  selectedChannels: string[]
  onChannelsChange: (channels: string[]) => void
}

export function McpIntegrationPanel({
  onDataSourcesUpdated,
  onUploadClick,
  slackEnabled,
  onSlackToggle,
  selectedChannels,
  onChannelsChange
}: McpIntegrationPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [slackLoading, setSlackLoading] = useState(true)
  const [slackUser, setSlackUser] = useState<SlackUser | null>(null)
  const [availableChannels, setAvailableChannels] = useState<string[]>([])
  const [popularChannels, setPopularChannels] = useState<string[]>([])
  const [showChannelSelector, setShowChannelSelector] = useState(false)
  const [channelSearch, setChannelSearch] = useState('')
  const [customChannel, setCustomChannel] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDocuments()
    checkSlackStatus()
  }, [])

  useEffect(() => {
    onDataSourcesUpdated(documents.length > 0)
  }, [documents, onDataSourcesUpdated])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowChannelSelector(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchDocuments = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      setLoading(false)
      return
    }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${backendUrl}/api/documents`, { signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok && response.headers.get('content-type')?.includes('json')) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.log('Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }

  const checkSlackStatus = async () => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
    if (!backendUrl) {
      setSlackLoading(false)
      return
    }
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${backendUrl}/api/slack/status`, { signal: controller.signal })
      clearTimeout(timeout)
      if (response.ok && response.headers.get('content-type')?.includes('json')) {
        const data = await response.json()
        setSlackUser(data.slackUser)
        setAvailableChannels(data.availableChannels || [])
        setPopularChannels(data.popularChannels || [])
        if (selectedChannels.length > 0 && !slackEnabled) {
          onSlackToggle(true)
        }
      }
    } catch (error) {
      console.log('Failed to check Slack status')
    } finally {
      setSlackLoading(false)
    }
  }

  const handleConnectSlack = () => {
    setShowChannelSelector(true)
  }

  const handleAddChannel = (channel: string) => {
    const cleanChannel = channel.replace(/^#/, '').trim()
    if (cleanChannel && !selectedChannels.includes(cleanChannel)) {
      const newChannels = [...selectedChannels, cleanChannel]
      onChannelsChange(newChannels)
      if (!slackEnabled) {
        onSlackToggle(true)
      }
    }
    setChannelSearch('')
  }

  const handleAddCustomChannel = () => {
    if (customChannel.trim()) {
      handleAddChannel(customChannel)
      setCustomChannel('')
    }
  }

  const handleRemoveChannel = (channel: string) => {
    const newChannels = selectedChannels.filter(c => c !== channel)
    onChannelsChange(newChannels)
    if (newChannels.length === 0) {
      onSlackToggle(false)
    }
  }

  const handleClearAll = () => {
    onChannelsChange([])
    onSlackToggle(false)
    setShowChannelSelector(false)
  }

  // Refetch when panel might have changed documents
  const handleClick = () => {
    onUploadClick()
    setTimeout(fetchDocuments, 500)
  }

  const hasDocuments = documents.length > 0
  const hasChannels = selectedChannels.length > 0

  // Filter available channels based on search
  const filteredChannels = availableChannels
    .filter(ch => ch.toLowerCase().includes(channelSearch.toLowerCase()))
    .filter(ch => !selectedChannels.includes(ch))
    .slice(0, 10)

  return (
    <div className="flex gap-2">
      {/* Documents button */}
      <button
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
          hasDocuments
            ? 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-800/30 text-green-700 dark:text-green-300'
            : 'bg-purple-100 dark:bg-purple-900/20 hover:bg-purple-200 dark:hover:bg-purple-800/30 text-purple-700 dark:text-purple-300'
        }`}
        title={hasDocuments
          ? `${documents.length} document${documents.length === 1 ? '' : 's'} active as context`
          : 'Upload documents to use as context'
        }
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : hasDocuments ? (
          <CheckCircle size={16} />
        ) : (
          <Upload size={16} />
        )}
        <span>
          {loading
            ? 'Loading...'
            : hasDocuments
              ? `${documents.length} Doc${documents.length === 1 ? '' : 's'}`
              : 'Docs'
          }
        </span>
      </button>

      {/* Slack button with channel selector */}
      <div className="relative" ref={dropdownRef}>
        {slackLoading ? (
          <button
            disabled
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-gray-100 dark:bg-gray-800 text-gray-400"
          >
            <Loader2 size={16} className="animate-spin" />
            <span>Slack</span>
          </button>
        ) : hasChannels ? (
          <div className="flex items-center">
            <button
              onClick={() => setShowChannelSelector(!showChannelSelector)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-l-md transition-colors ${
                slackEnabled
                  ? 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              title={`${selectedChannels.length} channel${selectedChannels.length === 1 ? '' : 's'} selected`}
            >
              <MessageSquare size={16} />
              <span>{selectedChannels.length} Channel{selectedChannels.length === 1 ? '' : 's'}</span>
              <ChevronDown size={14} />
            </button>
            <button
              onClick={() => onSlackToggle(!slackEnabled)}
              className={`flex items-center px-2 py-2 text-sm transition-colors border-l border-gray-200 dark:border-gray-700 ${
                slackEnabled
                  ? 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 text-blue-700'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500'
              }`}
              title={slackEnabled ? 'Disable Slack context' : 'Enable Slack context'}
            >
              {slackEnabled ? <CheckCircle size={14} /> : <X size={14} />}
            </button>
            <button
              onClick={handleClearAll}
              className="flex items-center px-2 py-2 text-sm rounded-r-md bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors border-l border-gray-200 dark:border-gray-700"
              title="Clear all channels"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnectSlack}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300"
            title="Add Slack channels for context"
          >
            <MessageSquare size={16} />
            <span>Add Slack</span>
          </button>
        )}

        {/* Channel Selector Dropdown */}
        {showChannelSelector && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-gray-100">Slack Channels</h3>
                {slackUser && (
                  <span className="text-xs text-gray-500">@{slackUser.slack_name}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select channels to include as context in your analysis
              </p>
            </div>

            {/* Selected channels */}
            {selectedChannels.length > 0 && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 mb-2">Selected channels:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedChannels.map(channel => (
                    <span
                      key={channel}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                    >
                      <Hash size={10} />
                      {channel}
                      <button
                        onClick={() => handleRemoveChannel(channel)}
                        className="hover:text-red-600 ml-1"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Popular channels - quick add */}
            {popularChannels.filter(ch => !selectedChannels.includes(ch)).length > 0 && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 mb-2">Popular channels:</div>
                <div className="flex flex-wrap gap-1">
                  {popularChannels
                    .filter(ch => !selectedChannels.includes(ch))
                    .slice(0, 8)
                    .map(channel => (
                      <button
                        key={channel}
                        onClick={() => handleAddChannel(channel)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-colors"
                      >
                        <Plus size={10} />
                        <Hash size={10} />
                        {channel}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Search/Add channel */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customChannel}
                  onChange={(e) => setCustomChannel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomChannel()}
                  placeholder="Type channel name..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
                <button
                  onClick={handleAddCustomChannel}
                  disabled={!customChannel.trim()}
                  className="px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Available channels list */}
            <div className="max-h-48 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  value={channelSearch}
                  onChange={(e) => setChannelSearch(e.target.value)}
                  placeholder="Search available channels..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
              </div>
              {filteredChannels.length > 0 ? (
                <div className="py-1">
                  {filteredChannels.map(channel => (
                    <button
                      key={channel}
                      onClick={() => handleAddChannel(channel)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      <Hash size={14} className="text-gray-400" />
                      {channel}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">
                  {channelSearch ? 'No matching channels' : 'Type to search channels'}
                </div>
              )}
            </div>

            {/* Done button */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowChannelSelector(false)}
                className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
