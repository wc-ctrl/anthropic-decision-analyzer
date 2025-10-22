'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface McpIntegrationState {
  slack: {
    connected: boolean
    authenticating: boolean
    error?: string
  }
  gdrive: {
    connected: boolean
    authenticating: boolean
    error?: string
  }
}

interface McpIntegrationPanelProps {
  onDataSourcesUpdated: (hasSlack: boolean, hasGDrive: boolean) => void
}

export function McpIntegrationPanel({ onDataSourcesUpdated }: McpIntegrationPanelProps) {
  const [mcpState, setMcpState] = useState<McpIntegrationState>({
    slack: { connected: false, authenticating: false },
    gdrive: { connected: false, authenticating: false }
  })

  useEffect(() => {
    // Check if MCP connections are already established
    checkExistingConnections()
  }, [])

  useEffect(() => {
    // Notify parent when data sources change
    onDataSourcesUpdated(mcpState.slack.connected, mcpState.gdrive.connected)
  }, [mcpState, onDataSourcesUpdated])

  const checkExistingConnections = async () => {
    try {
      // Check Slack connection
      const slackResponse = await fetch('/api/mcp/test-slack')
      const slackConnected = slackResponse.ok

      // Check Google Drive connection
      const gdriveResponse = await fetch('/api/mcp/test-gdrive')
      const gdriveConnected = gdriveResponse.ok

      setMcpState(prev => ({
        slack: { ...prev.slack, connected: slackConnected },
        gdrive: { ...prev.gdrive, connected: gdriveConnected }
      }))
    } catch (error) {
      console.log('MCP connections not yet established')
    }
  }

  const handleSlackConnect = async () => {
    setMcpState(prev => ({
      ...prev,
      slack: { ...prev.slack, authenticating: true, error: undefined }
    }))

    try {
      const response = await fetch('/api/mcp/connect-slack', { method: 'POST' })
      const result = await response.json()

      if (response.ok) {
        setMcpState(prev => ({
          ...prev,
          slack: { connected: true, authenticating: false }
        }))
      } else {
        throw new Error(result.error || 'Failed to connect to Slack')
      }
    } catch (error) {
      setMcpState(prev => ({
        ...prev,
        slack: {
          connected: false,
          authenticating: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }))
    }
  }

  const handleGDriveConnect = async () => {
    setMcpState(prev => ({
      ...prev,
      gdrive: { ...prev.gdrive, authenticating: true, error: undefined }
    }))

    try {
      const response = await fetch('/api/mcp/connect-gdrive', { method: 'POST' })
      const result = await response.json()

      if (response.ok) {
        setMcpState(prev => ({
          ...prev,
          gdrive: { connected: true, authenticating: false }
        }))
      } else {
        throw new Error(result.error || 'Failed to connect to Google Drive')
      }
    } catch (error) {
      setMcpState(prev => ({
        ...prev,
        gdrive: {
          connected: false,
          authenticating: false,
          error: error instanceof Error ? error.message : 'Connection failed'
        }
      }))
    }
  }

  const getStatusIcon = (connected: boolean, authenticating: boolean, error?: string) => {
    if (authenticating) return <Loader2 size={16} className="animate-spin text-blue-500" />
    if (error) return <AlertCircle size={16} className="text-red-500" />
    if (connected) return <CheckCircle size={16} className="text-green-500" />
    return <AlertCircle size={16} className="text-gray-400" />
  }

  return (
    <div className="flex gap-2">
      {/* Slack Integration Button */}
      <button
        onClick={handleSlackConnect}
        disabled={mcpState.slack.authenticating || mcpState.slack.connected}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
          mcpState.slack.connected
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-default'
            : 'bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300'
        }`}
        title={mcpState.slack.connected ? 'Slack connected' : 'Connect to Slack for team context'}
      >
        <MessageCircle size={16} />
        {getStatusIcon(mcpState.slack.connected, mcpState.slack.authenticating, mcpState.slack.error)}
        {mcpState.slack.authenticating ? 'Connecting...' : mcpState.slack.connected ? 'Slack Connected' : 'Connect Slack'}
      </button>

      {/* Google Drive Integration Button */}
      <button
        onClick={handleGDriveConnect}
        disabled={mcpState.gdrive.authenticating || mcpState.gdrive.connected}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
          mcpState.gdrive.connected
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 cursor-default'
            : 'bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-800/30 text-orange-700 dark:text-orange-300'
        }`}
        title={mcpState.gdrive.connected ? 'Google Drive connected' : 'Connect to Google Drive for document context'}
      >
        <FileText size={16} />
        {getStatusIcon(mcpState.gdrive.connected, mcpState.gdrive.authenticating, mcpState.gdrive.error)}
        {mcpState.gdrive.authenticating ? 'Connecting...' : mcpState.gdrive.connected ? 'Drive Connected' : 'Connect Drive'}
      </button>
    </div>
  )
}