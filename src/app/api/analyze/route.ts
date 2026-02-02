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
    const { type, input, useSlack = true, useGDrive = true, timestamp, isExpertMode = true, firstOrderCount = 5, secondOrderCount = 2 } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    // Parse comma-separated inputs for multi-root analysis
    const inputs = input.split(',').map((i: string) => i.trim()).filter((i: string) => i.length > 0)

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

    // Enhanced web search for real-time context
    let webContext = null
    try {
      const webSearchResponse = await fetch(`${request.url.split('/api')[0]}/api/web-enhanced-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          analysisType: type,
          selectedScaffolds,
          isNonUSFocused: selectedScaffolds?.isNonUSFocused || false
        })
      })

      if (webSearchResponse.ok) {
        webContext = await webSearchResponse.json()
      }
    } catch (error) {
      console.log('Web search enhancement failed, proceeding without:', error)
    }

    // Generate analysis for each input
    let analysis
    if (inputs.length === 1) {
      // Single root - use original logic
      if (type === 'decision') {
        analysis = await generateConsequences(inputs[0], contextualData, timestamp, selectedScaffolds, isExpertMode, firstOrderCount, secondOrderCount, webContext)
      } else if (type === 'forecast') {
        analysis = await generateCausalPathways(inputs[0], contextualData, timestamp, selectedScaffolds, isExpertMode, firstOrderCount, secondOrderCount, webContext)
      } else {
        return NextResponse.json(
          { error: 'Invalid analysis type' },
          { status: 400 }
        )
      }
    } else {
      // Multiple roots - generate combined analysis
      analysis = await generateMultiRootAnalysis(inputs, type, contextualData, timestamp, selectedScaffolds, isExpertMode, firstOrderCount, secondOrderCount, webContext)
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

async function generateConsequences(decision: string, contextualData?: any, timestamp?: number, scaffolds?: any, isExpertMode: boolean = true, firstOrderCount: number = 5, secondOrderCount: number = 2, webContext?: any) {
  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 4000,
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

${webContext ? `
REAL-TIME WEB INTELLIGENCE:
${webContext.contextualIntelligence}

Search Strategy Applied: ${webContext.searchStrategy}
Last Updated: ${webContext.lastUpdated}

Use this real-time information to enhance the accuracy and relevance of your analysis.
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
1. EXACTLY ${firstOrderCount} first-order consequences (direct results)
2. For EACH of the ${firstOrderCount} first-order consequences, EXACTLY ${secondOrderCount} second-order consequences (consequences of consequences)
` : `
Generate a simplified analysis with:
1. EXACTLY 3 first-order consequences (direct results)
2. For EACH of the 3 first-order consequences, EXACTLY 1 second-order consequence (consequence of consequence)
`}

For each consequence, provide:
- A concise title (max 8 words)
- A brief description (1-2 sentences)
- A sentiment classification: "positive" (beneficial), "negative" (harmful), or "neutral" (mixed/unclear)

${isExpertMode ? `
IMPORTANT: Return ONLY valid JSON with this EXACT structure (5→2 Expert Mode):
` : `
IMPORTANT: Return ONLY valid JSON with this EXACT structure (3→1 Easy Mode):
`}
{
  "firstOrder": [
${isExpertMode ? `
    {"title": "First consequence title", "description": "Brief description", "sentiment": "positive"},
    {"title": "Second consequence title", "description": "Brief description", "sentiment": "negative"},
    {"title": "Third consequence title", "description": "Brief description", "sentiment": "neutral"},
    {"title": "Fourth consequence title", "description": "Brief description", "sentiment": "positive"},
    {"title": "Fifth consequence title", "description": "Brief description", "sentiment": "negative"}
` : `
    {"title": "First consequence title", "description": "Brief description", "sentiment": "positive"},
    {"title": "Second consequence title", "description": "Brief description", "sentiment": "negative"},
    {"title": "Third consequence title", "description": "Brief description", "sentiment": "neutral"}
`}
  ],
  "secondOrder": {
${isExpertMode ? `
    "0": [
      {"title": "First sub-consequence", "description": "Brief description", "sentiment": "positive"},
      {"title": "Second sub-consequence", "description": "Brief description", "sentiment": "negative"}
    ],
    "1": [
      {"title": "First sub-consequence", "description": "Brief description", "sentiment": "positive"},
      {"title": "Second sub-consequence", "description": "Brief description", "sentiment": "negative"}
    ],
    "2": [
      {"title": "First sub-consequence", "description": "Brief description", "sentiment": "positive"},
      {"title": "Second sub-consequence", "description": "Brief description", "sentiment": "negative"}
    ],
    "3": [
      {"title": "First sub-consequence", "description": "Brief description", "sentiment": "positive"},
      {"title": "Second sub-consequence", "description": "Brief description", "sentiment": "negative"}
    ],
    "4": [
      {"title": "First sub-consequence", "description": "Brief description", "sentiment": "positive"},
      {"title": "Second sub-consequence", "description": "Brief description", "sentiment": "negative"}
    ]
` : `
    "0": [
      {"title": "Sub-consequence", "description": "Brief description", "sentiment": "neutral"}
    ],
    "1": [
      {"title": "Sub-consequence", "description": "Brief description", "sentiment": "neutral"}
    ],
    "2": [
      {"title": "Sub-consequence", "description": "Brief description", "sentiment": "neutral"}
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

async function generateCausalPathways(forecast: string, contextualData?: any, timestamp?: number, scaffolds?: any, isExpertMode: boolean = true, firstOrderCount: number = 5, secondOrderCount: number = 2, webContext?: any) {
  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 4000,
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

${webContext ? `
REAL-TIME WEB INTELLIGENCE:
${webContext.contextualIntelligence}

Search Strategy Applied: ${webContext.searchStrategy}
Last Updated: ${webContext.lastUpdated}

Use this real-time information to enhance the accuracy and relevance of your causal analysis.
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
- A sentiment classification: "positive" (favorable cause), "negative" (concerning cause), or "neutral" (mixed impact)

Use superforecasting principles:
- Consider base rates and historical precedents
- Account for regression to the mean
- Avoid overconfidence bias
- Use reference class forecasting
- Consider both inside and outside view perspectives

IMPORTANT: Return ONLY valid JSON with this EXACT structure:
{
  "firstOrder": [
    {"title": "Primary causal factor", "description": "Description", "probability": 85, "sentiment": "positive"},
    {"title": "Secondary causal factor", "description": "Description", "probability": 72, "sentiment": "negative"},
    {"title": "Third causal factor", "description": "Description", "probability": 68, "sentiment": "neutral"},
    {"title": "Fourth causal factor", "description": "Description", "probability": 60, "sentiment": "positive"},
    {"title": "Fifth causal factor", "description": "Description", "probability": 55, "sentiment": "negative"}
  ],
  "secondOrder": {
    "0": [
      {"title": "Underlying factor 1", "description": "Description", "probability": 78, "sentiment": "positive"},
      {"title": "Underlying factor 2", "description": "Description", "probability": 65, "sentiment": "negative"}
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

async function generateMultiRootAnalysis(
  inputs: string[],
  type: string,
  contextualData?: any,
  timestamp?: number,
  scaffolds?: any,
  isExpertMode: boolean = true,
  firstOrderCount: number = 5,
  secondOrderCount: number = 2,
  webContext?: any
) {
  // Generate analysis for each input
  const analyses = await Promise.all(
    inputs.map((input, index) =>
      type === 'decision'
        ? generateConsequences(input, contextualData, timestamp, scaffolds, isExpertMode, firstOrderCount, secondOrderCount, webContext)
        : generateCausalPathways(input, contextualData, timestamp, scaffolds, isExpertMode, firstOrderCount, secondOrderCount, webContext)
    )
  )

  // Analyze cross-root causal relationships
  let crossRootConnections: any[] = []
  if (inputs.length > 1) {
    try {
      const crossRootResponse = await anthropic.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: `You are analyzing the causal relationships between multiple ${type === 'decision' ? 'decisions' : 'forecasts/outcomes'}.

Given these ${type === 'decision' ? 'decisions' : 'outcomes'}:
${inputs.map((input, idx) => `${idx + 1}. "${input}"`).join('\n')}

Identify the direct causal relationships between these factors. For each relationship, specify:
- Which factor influences which other factor(s)
- The strength of influence (weak, moderate, strong)
- The nature of the relationship (enables, blocks, amplifies, reduces, causes, prevents)
- A brief explanation (1 sentence)

${type === 'decision' ? `
Examples of decision relationships:
- "Launch product in Q2" might ENABLE "Expand to EU markets" (strong, enables)
- "Increase R&D spending" might AMPLIFY "Launch product in Q2" (moderate, amplifies)
- "Cut costs" might BLOCK "Increase R&D spending" (strong, blocks)
` : `
Examples of outcome relationships:
- "Market consolidates" might CAUSE "AI regulation passes" (moderate, causes)
- "Economic downturn" might PREVENT "Market expansion" (strong, prevents)
`}

Return ONLY valid JSON with this structure:
{
  "connections": [
    {
      "from": 0,
      "to": 1,
      "strength": "strong",
      "nature": "enables",
      "explanation": "One sentence explanation"
    }
  ]
}

If no significant causal relationships exist, return: {"connections": []}

Focus only on DIRECT relationships between the root factors, not indirect effects.`
        }]
      })

      const responseText = crossRootResponse.content[0].type === 'text' ? crossRootResponse.content[0].text : ''
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : responseText
      const crossRootData = JSON.parse(jsonText)
      crossRootConnections = crossRootData.connections || []
    } catch (error) {
      console.log('Cross-root analysis failed, proceeding without connections:', error)
    }
  }

  // Combine all analyses into a single structure with multiple root nodes
  const combinedFirstOrder: any[] = []
  const combinedSecondOrder: any = {}

  inputs.forEach((inputText, rootIndex) => {
    const analysis = analyses[rootIndex].analysis

    // Add all first-order items for this root
    analysis.firstOrder.forEach((item: any, itemIndex: number) => {
      const globalIndex = combinedFirstOrder.length
      combinedFirstOrder.push({
        ...item,
        rootIndex: rootIndex,
        rootLabel: inputText
      })

      // Map second-order items
      const localSecondOrder = analysis.secondOrder[itemIndex.toString()]
      if (localSecondOrder) {
        combinedSecondOrder[globalIndex.toString()] = localSecondOrder
      }
    })
  })

  return {
    type: type,
    analysis: {
      firstOrder: combinedFirstOrder,
      secondOrder: combinedSecondOrder,
      multiRoot: true,
      rootInputs: inputs,
      crossRootConnections: crossRootConnections
    },
    input: inputs.join(', ')
  }
}