import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { DecisionAnalysis, Commentary } from '@/types/decision'
import { v4 as uuidv4 } from 'uuid'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, input, useSlack = true, useGDrive = true, timestamp, isExpertMode = true } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Get contextual data from MCP sources if available
    let contextualData = null
    const sources = []
    if (useSlack) sources.push('slack')
    if (useGDrive) sources.push('gdrive')

    if (sources.length > 0) {
      try {
        const contextResponse = await fetch(`${request.url.split('/api')[0]}/api/mcp/get-context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: input, sources })
        })

        if (contextResponse.ok) {
          const contextResult = await contextResponse.json()
          contextualData = contextResult.context
        }
      } catch (contextError) {
        console.log('Context retrieval failed, proceeding without MCP data:', contextError)
      }
    }

    // First tier: Select optimal analytical scaffolds for this topic
    const scaffoldResponse = await fetch(`${request.url.split('/api')[0]}/api/select-scaffolds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: input, analysisType: type })
    })

    let selectedScaffolds = null
    if (scaffoldResponse.ok) {
      selectedScaffolds = await scaffoldResponse.json()
    }

    let analysis
    if (type === 'decision') {
      analysis = await generateConsequences(input, contextualData, timestamp, selectedScaffolds, isExpertMode)
    } else if (type === 'forecast') {
      analysis = await generateCausalPathways(input, contextualData, timestamp, selectedScaffolds, isExpertMode)
    } else {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      )
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    )
  }
}

async function generateConsequences(decision: string, contextualData?: any, timestamp?: number, scaffolds?: any, isExpertMode: boolean = true) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert business analyst helping executives analyze decisions.

Given this decision: "${decision}"

${contextualData ? `
ADDITIONAL CONTEXT from organizational sources:

Slack Conversations:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- ${msg.channel}: ${msg.content}`).join('\n') : 'No Slack data available'}

Google Drive Documents:
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- ${doc.fileName}: ${doc.excerpt}`).join('\n') : 'No Google Drive data available'}

Use this context to inform your analysis, but focus primarily on strategic business implications.
` : ''}

${scaffolds && scaffolds.selectedScaffolds ? `
ANALYTICAL FRAMEWORKS to guide your analysis:

${scaffolds.selectedScaffolds.map((scaffold: any, index: number) => `
${index + 1}. **${scaffold.name}** (${scaffold.category})
   Rationale: ${scaffold.rationale}
   Framework: ${scaffold.fullDescription?.substring(0, 300) || scaffold.description?.substring(0, 300)}...
`).join('')}

TOPIC ANALYSIS PROFILE:
- Complexity: ${scaffolds.topicAnalysis?.complexity || 'medium'}
- Information Availability: ${scaffolds.topicAnalysis?.informationAvailability || 'medium'}
- Time Horizon: ${scaffolds.topicAnalysis?.timeHorizon || 'medium'}
- Uncertainty Level: ${scaffolds.topicAnalysis?.uncertaintyLevel || 'medium'}

RECOMMENDED APPROACH: ${scaffolds.analyticalApproach || 'Multi-factor systematic analysis'}

Apply these frameworks to enhance the rigor and depth of your consequence analysis.
` : ''}

${isExpertMode ? `
Generate a structured analysis with:
1. EXACTLY 5 first-order consequences (direct results)
2. For EACH of the 5 first-order consequences, EXACTLY 2 second-order consequences (consequences of consequences)
` : `
Generate a simplified analysis with:
1. EXACTLY 3 first-order consequences (direct results)
2. For EACH of the 3 first-order consequences, EXACTLY 1 second-order consequence (consequence of consequence)
`}

For each consequence, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)

${isExpertMode ? `
IMPORTANT: Return ONLY valid JSON with this EXACT structure (5→2 Expert Mode):
` : `
IMPORTANT: Return ONLY valid JSON with this EXACT structure (3→1 Easy Mode):
`}
{
  "firstOrder": [
${isExpertMode ? `
    {"title": "First consequence title", "description": "Brief description"},
    {"title": "Second consequence title", "description": "Brief description"},
    {"title": "Third consequence title", "description": "Brief description"},
    {"title": "Fourth consequence title", "description": "Brief description"},
    {"title": "Fifth consequence title", "description": "Brief description"}
` : `
    {"title": "First consequence title", "description": "Brief description"},
    {"title": "Second consequence title", "description": "Brief description"},
    {"title": "Third consequence title", "description": "Brief description"}
`}
  ],
  "secondOrder": {
${isExpertMode ? `
    "0": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "1": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "2": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "3": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ],
    "4": [
      {"title": "First sub-consequence", "description": "Brief description"},
      {"title": "Second sub-consequence", "description": "Brief description"}
    ]
` : `
    "0": [
      {"title": "Sub-consequence", "description": "Brief description"}
    ],
    "1": [
      {"title": "Sub-consequence", "description": "Brief description"}
    ],
    "2": [
      {"title": "Sub-consequence", "description": "Brief description"}
    ]
`}  }
}

Focus on realistic, business-relevant consequences that executives would care about. Consider financial, operational, strategic, and human impacts.

${timestamp ? `
ANALYSIS VARIATION: This is a fresh analysis run. Explore different angles and alternative consequences that might not have been considered in previous analyses. Consider contrarian viewpoints and less obvious implications while maintaining realism.
` : ''}`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw Claude response:', responseText)

  // Extract JSON from response if it's wrapped in other text
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  let analysis
  try {
    analysis = JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed:', error)
    console.error('Response text:', responseText)
    throw new Error('Invalid JSON response from Claude')
  }

  return {
    type: 'decision',
    analysis,
    input: decision
  }
}

async function generateCausalPathways(forecast: string, contextualData?: any, timestamp?: number, scaffolds?: any, isExpertMode: boolean = true) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are an expert superforecaster trained in the methodology of Philip Tetlock and the Good Judgment Project. You understand base rates, reference class forecasting, and probabilistic reasoning.

Given this outcome/forecast: "${forecast}"

${contextualData ? `
ADDITIONAL CONTEXT from organizational sources:

Slack Conversations:
${contextualData.slack ? contextualData.slack.map((msg: any) => `- ${msg.channel}: ${msg.content}`).join('\n') : 'No Slack data available'}

Google Drive Documents:
${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => `- ${doc.fileName}: ${doc.excerpt}`).join('\n') : 'No Google Drive data available'}

Use this context to ground your probability estimates in real organizational data and strategic discussions.
` : ''}

${scaffolds && scaffolds.selectedScaffolds ? `
ANALYTICAL FRAMEWORKS to enhance your causal analysis:

${scaffolds.selectedScaffolds.map((scaffold: any, index: number) => `
${index + 1}. **${scaffold.name}** (${scaffold.category})
   Rationale: ${scaffold.rationale}
   Framework: ${scaffold.fullDescription?.substring(0, 300) || scaffold.description?.substring(0, 300)}...
`).join('')}

TOPIC ANALYSIS PROFILE:
- Complexity: ${scaffolds.topicAnalysis?.complexity || 'medium'}
- Information Availability: ${scaffolds.topicAnalysis?.informationAvailability || 'medium'}
- Time Horizon: ${scaffolds.topicAnalysis?.timeHorizon || 'medium'}
- Uncertainty Level: ${scaffolds.topicAnalysis?.uncertaintyLevel || 'medium'}

RECOMMENDED APPROACH: ${scaffolds.analyticalApproach || 'Multi-factor systematic analysis'}

${scaffolds.isNonUSFocused ? `
ESOTERIC SEARCH GUIDANCE: This topic requires specialized source access. Prioritize:
- Government statistical agencies and central banks
- Non-English and regional sources in native languages
- Technical specifications and regulatory documents
- Open-source intelligence repositories
` : ''}

Apply these frameworks to enhance the rigor and depth of your causal analysis.
` : ''}

${isExpertMode ? `
Generate a comprehensive causal analysis showing what led to this outcome:
1. EXACTLY 5 first-order causes (direct drivers that led to this outcome)
2. For EACH first-order cause, EXACTLY 2 second-order causes (underlying factors)
` : `
Generate a simplified causal analysis showing what led to this outcome:
1. EXACTLY 3 first-order causes (direct drivers that led to this outcome)
2. For EACH first-order cause, EXACTLY 1 second-order cause (underlying factor)
`}

For each cause, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)
- A probability estimate (0-100) representing how likely this factor was to contribute significantly to the outcome

Use superforecasting principles:
- Consider base rates and historical precedents
- Account for regression to the mean
- Avoid overconfidence bias
- Use reference class forecasting
- Consider both inside and outside view perspectives

IMPORTANT: Return ONLY valid JSON with this EXACT structure:
{
  "firstOrder": [
    {"title": "Primary causal factor", "description": "Description", "probability": 85},
    {"title": "Secondary causal factor", "description": "Description", "probability": 72},
    {"title": "Third causal factor", "description": "Description", "probability": 68},
    {"title": "Fourth causal factor", "description": "Description", "probability": 60},
    {"title": "Fifth causal factor", "description": "Description", "probability": 55}
  ],
  "secondOrder": {
    "0": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 78},
      {"title": "Underlying factor 2", "description": "Description", "probability": 65}
    ],
    "1": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 70},
      {"title": "Underlying factor 2", "description": "Description", "probability": 62}
    ],
    "2": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 66},
      {"title": "Underlying factor 2", "description": "Description", "probability": 58}
    ],
    "3": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 64},
      {"title": "Underlying factor 2", "description": "Description", "probability": 54}
    ],
    "4": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 61},
      {"title": "Underlying factor 2", "description": "Description", "probability": 52}
    ]
  }
}

Focus on realistic, evidence-based causal factors. Consider market dynamics, technological trends, regulatory changes, and competitive forces.

${timestamp ? `
ANALYSIS VARIATION: This is a fresh causal analysis run. Consider alternative causal pathways and different probability estimates that might reflect varied scenarios or perspectives. Explore less obvious but plausible causal factors while maintaining superforecasting rigor.
` : ''}`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw Claude forecast response:', responseText)

  // Extract JSON from response if it's wrapped in other text
  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  let analysis
  try {
    analysis = JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for forecast:', error)
    console.error('Response text:', responseText)
    throw new Error('Invalid JSON response from Claude')
  }

  return {
    type: 'forecast',
    analysis,
    input: forecast
  }
}