'use client'

import React, { useState, useEffect } from 'react'
import { FileText, ExternalLink, Loader2, X, Globe, Plus, Trash2, File, FileSpreadsheet } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
}

interface DataSourceBrowserProps {
  isOpen: boolean
  onClose: () => void
  onImportContent: (content: string, source: string) => void
  hasDocuments: boolean
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pptx: <FileSpreadsheet size={18} className="text-orange-500" />,
  docx: <FileText size={18} className="text-blue-500" />,
  pdf: <File size={18} className="text-red-500" />,
  txt: <FileText size={18} className="text-gray-500" />,
  md: <FileText size={18} className="text-purple-500" />,
}

export function DataSourceBrowser({
  isOpen,
  onClose,
  onImportContent,
  hasDocuments
}: DataSourceBrowserProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'website'>('documents')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isLoadingWebsite, setIsLoadingWebsite] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [docContent, setDocContent] = useState<string>('')
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [isLoadingDocs, setIsLoadingDocs] = useState(false)
  const [websiteContent, setWebsiteContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && activeTab === 'documents') {
      loadDocuments()
    }
  }, [isOpen, activeTab])

  const loadDocuments = async () => {
    setIsLoadingDocs(true)
    setError(null)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
      setError('Failed to load documents')
    } finally {
      setIsLoadingDocs(false)
    }
  }

  const handleDocClick = async (doc: Document) => {
    setSelectedDoc(doc)
    setIsLoadingContent(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/documents/${doc.id}`)
      if (response.ok) {
        const data = await response.json()
        setDocContent(data.content || '')
      }
    } catch (error) {
      console.error('Failed to load document content:', error)
      setDocContent('Error loading content')
    } finally {
      setIsLoadingContent(false)
    }
  }

  const handleDeleteDoc = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/documents/${docId}`, { method: 'DELETE' })
      if (response.ok) {
        if (selectedDoc?.id === docId) {
          setSelectedDoc(null)
          setDocContent('')
        }
        loadDocuments()
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
    }
  }

  const handleLoadWebsite = async () => {
    if (!websiteUrl.trim()) return

    setIsLoadingWebsite(true)
    setWebsiteContent('')
    setError(null)

    try {
      const response = await fetch('/api/fetch-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.content) {
        setWebsiteContent(data.content)
      } else {
        throw new Error('No content returned')
      }
    } catch (error) {
      console.error('Failed to load website:', error)
      setError(`Failed to load website. ${error instanceof Error ? error.message : ''}`)
    } finally {
      setIsLoadingWebsite(false)
    }
  }

  const handleImport = () => {
    if (activeTab === 'documents' && selectedDoc && docContent) {
      onImportContent(docContent, `Document: ${selectedDoc.name}`)
      onClose()
    } else if (activeTab === 'website' && websiteContent) {
      onImportContent(websiteContent, `Website: ${websiteUrl}`)
      onClose()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Plus size={24} className="text-purple-600 dark:text-purple-400" />
              Add Context to Analysis
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Select uploaded documents or fetch website content
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'documents'
                ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <FileText size={18} />
            My Documents {documents.length > 0 && `(${documents.length})`}
          </button>
          <button
            onClick={() => setActiveTab('website')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'website'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <Globe size={18} />
            Website
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            <button onClick={() => setError(null)}><X size={16} className="text-red-600" /></button>
          </div>
        )}

        {/* URL Input for Website Tab */}
        {activeTab === 'website' && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLoadWebsite()}
                  placeholder="Enter website URL (e.g., https://example.com)"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <button
                onClick={handleLoadWebsite}
                disabled={isLoadingWebsite || !websiteUrl.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                {isLoadingWebsite ? <Loader2 size={18} className="animate-spin" /> : <ExternalLink size={18} />}
                Fetch
              </button>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* List */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            {activeTab === 'documents' ? (
              <div className="p-4 space-y-2">
                {isLoadingDocs ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-gray-400" />
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No documents uploaded</p>
                    <p className="text-xs mt-1">Use the Upload Documents button to add files</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleDocClick(doc)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
                        selectedDoc?.id === doc.id
                          ? 'bg-purple-100 dark:bg-purple-900/30'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {FILE_TYPE_ICONS[doc.type] || <FileText size={18} className="text-gray-500" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                          {doc.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(doc.size)}
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleDeleteDoc(doc.id, e)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                      >
                        <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
                      </button>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="p-4">
                {websiteContent ? (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="flex items-start gap-2">
                      <Globe size={18} className="text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                          {websiteUrl}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Content loaded</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Globe size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Enter a URL above</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {(activeTab === 'documents' && selectedDoc) || (activeTab === 'website' && websiteContent) ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {activeTab === 'documents' ? selectedDoc?.name : 'Website Content'}
                  </h3>
                  <button
                    onClick={handleImport}
                    disabled={isLoadingContent || isLoadingWebsite}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    Add to Analysis
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  {isLoadingContent || isLoadingWebsite ? (
                    <div className="flex justify-center items-center h-full">
                      <Loader2 size={32} className="animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono">
                      {activeTab === 'documents' ? docContent : websiteContent}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {activeTab === 'documents' ? 'Select a document to preview' : 'Enter a URL and click Fetch'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
