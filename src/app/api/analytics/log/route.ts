import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import type { AnalyticsEvent } from '@/types/analytics'

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-events.jsonl')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, sessionId, data: eventData } = body

    const event: AnalyticsEvent = {
      type,
      timestamp: new Date().toISOString(),
      sessionId,
      ...(eventData && { data: eventData }),
    }

    await fs.appendFile(ANALYTICS_FILE, JSON.stringify(event) + '\n')

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Analytics logging failed:', error)
    return NextResponse.json({ success: false }, { status: 500, headers: corsHeaders })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}
