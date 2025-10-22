'use client'

import { useCallback } from 'react'
// Dynamic import for client-side only usage

export function useScreenshot() {
  const captureElement = useCallback(async (elementId: string): Promise<string | null> => {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        console.error(`Element with id "${elementId}" not found`)
        return null
      }

      // Dynamic import for client-side only
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 1.5, // Higher resolution
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      })

      // Convert canvas to base64 image
      const imageData = canvas.toDataURL('image/png', 0.8)
      return imageData

    } catch (error) {
      console.error('Screenshot capture failed:', error)
      return null
    }
  }, [])

  const captureReactFlow = useCallback(async (): Promise<string | null> => {
    try {
      // Capture the React Flow viewport
      const reactFlowElement = document.querySelector('.react-flow') as HTMLElement
      if (!reactFlowElement) {
        console.error('React Flow element not found')
        return null
      }

      // Dynamic import for client-side only
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(reactFlowElement, {
        backgroundColor: '#f9fafb', // Light gray background
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false
      })

      const imageData = canvas.toDataURL('image/png', 0.8)
      return imageData

    } catch (error) {
      console.error('React Flow screenshot capture failed:', error)
      return null
    }
  }, [])

  const captureScenarioPanel = useCallback(async (): Promise<string | null> => {
    try {
      // Capture the scenario display panel
      const scenarioElement = document.querySelector('.scenario-display-panel') as HTMLElement
      if (!scenarioElement) {
        console.error('Scenario panel element not found')
        return null
      }

      // Dynamic import for client-side only
      const html2canvas = (await import('html2canvas')).default

      const canvas = await html2canvas(scenarioElement, {
        backgroundColor: '#f9fafb',
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        scrollX: 0,
        scrollY: 0
      })

      const imageData = canvas.toDataURL('image/png', 0.8)
      return imageData

    } catch (error) {
      console.error('Scenario panel screenshot capture failed:', error)
      return null
    }
  }, [])

  return {
    captureElement,
    captureReactFlow,
    captureScenarioPanel
  }
}