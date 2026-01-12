'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Upload, FileText, Trash2, Loader2, File, FileSpreadsheet, CheckCircle } from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: string
  excerpt?: string
}

interface DocumentUploadPanelProps {
  isOpen: boolean
  onClose: () => void
  onDocumentsChange: (count: number) => void
}

const FILE_TYPE_ICONS: Record<string, React.ReactNode> = {
  pptx: <FileSpreadsheet size={20} className="text-orange-500" />,
  docx: <FileText size={20} className="text-blue-500" />,
  pdf: <File size={20} className="text-red-500" />,
  txt: <FileText size={20} className="text-gray-500" />,
  md: <FileText size={20} className="text-purple-500" />,
}

export function DocumentUploadPanel({ isOpen, onClose, onDocumentsChange }: DocumentUploadPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/documents`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
        onDocumentsChange(data.documents?.length || 0)
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err)
    }
  }, [onDocumentsChange])

  useEffect(() => {
    if (isOpen) {
      fetchDocuments()
      // Clear messages when panel opens
      setError(null)
      setSuccessMessage(null)
    }
  }, [isOpen, fetchDocuments])

  // Auto-hide success message after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)
    setSuccessMessage(null)

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
    let successCount = 0
    const uploadedNames: string[] = []

    for (const file of Array.from(files)) {
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch(`${backendUrl}/api/documents/upload`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.detail || 'Upload failed')
        }

        successCount++
        uploadedNames.push(file.name)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      }
    }

    setUploading(false)

    if (successCount > 0) {
      if (successCount === 1) {
        setSuccessMessage(`"${uploadedNames[0]}" uploaded successfully and will be used as context for your analysis.`)
      } else {
        setSuccessMessage(`${successCount} documents uploaded successfully and will be used as context for your analysis.`)
      }
    }

    fetchDocuments()
  }

  const handleDelete = async (docId: string) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || ''
      const response = await fetch(`${backendUrl}/api/documents/${docId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchDocuments()
      }
    } catch (err) {
      console.error('Failed to delete document:', err)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleUpload(e.dataTransfer.files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload Documents
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
              </div>
              <button onClick={() => setSuccessMessage(null)} className="text-green-600 hover:text-green-800">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="animate-spin text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Supported: .pptx, .docx, .pdf, .txt, .md (max 10MB)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pptx,.docx,.pdf,.txt,.md"
                  onChange={(e) => handleUpload(e.target.files)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)}><X size={16} /></button>
            </div>
          )}

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploaded Documents ({documents.length})
                </h3>
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                  Active in analysis
                </span>
              </div>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    {FILE_TYPE_ICONS[doc.type] || <FileText size={20} className="text-gray-500" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.size)} • {formatDate(doc.uploadedAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      title="Delete document"
                    >
                      <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length === 0 && !uploading && (
            <p className="mt-6 text-center text-sm text-gray-500">
              No documents uploaded yet. Upload documents to provide context for your analysis.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
          <p className="text-xs text-gray-500">
            {documents.length > 0
              ? `${documents.length} document${documents.length === 1 ? '' : 's'} will be used as context`
              : 'Documents provide context for more informed analysis'}
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
