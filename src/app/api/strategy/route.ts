import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client server-side
const anthropic = new Anthropic({
  apiKey: process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, priorAnalysis, contextualData, webContext } = body

    if (!process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      )
    }

    const strategy = await generateComprehensiveStrategy(input, priorAnalysis, contextualData, webContext)
    return NextResponse.json(strategy)

  } catch (error) {
    console.error('Strategy generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate strategic framework' },
      { status: 500 }
    )
  }
}

async function generateComprehensiveStrategy(
  input: string,
  priorAnalysis?: any,
  contextualData?: any,
  webContext?: any
) {
  const message = await anthropic.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    max_tokens: 16000,
    messages: [{
      role: 'user',
      content: `You are an expert strategic planner specializing in comprehensive Ends-Ways-Means strategic framework development.

STRATEGIC OBJECTIVE: "${input}"

${priorAnalysis ? `
PRIOR ANALYSIS INSIGHTS:
Decision Analysis: ${priorAnalysis.decision ? priorAnalysis.decision.summary : 'Not available'}
Causal Analysis: ${priorAnalysis.causal ? priorAnalysis.causal.summary : 'Not available'}
Scenario Analysis: ${priorAnalysis.scenario ? priorAnalysis.scenario.summary : 'Not available'}
` : ''}

${contextualData ? `
ORGANIZATIONAL CONTEXT:
Slack Conversations: ${contextualData.slack ? contextualData.slack.map((msg: any) => msg.content).join('; ') : 'None'}
Google Drive Documents: ${contextualData.gdrive ? contextualData.gdrive.map((doc: any) => doc.excerpt).join('; ') : 'None'}
` : ''}

${webContext ? `
REAL-TIME WEB INTELLIGENCE:
${webContext.contextualIntelligence?.substring(0, 800) || 'Web intelligence available'}
` : ''}

TASK: Develop a comprehensive strategic framework using the Ends-Ways-Means methodology with rigorous analytical evaluation.

Use the WebSearch tool to enhance your strategic analysis with current information about:
1. Similar strategic initiatives and their outcomes
2. Current market/competitive environment
3. Regulatory and policy landscape
4. Resource availability and constraints
5. Expert strategic planning best practices

Analyze the strategic objective across these dimensions:

## ENDS (Strategic Objectives)
Evaluate:
1. Specificity: Are objectives measurable and time-bounded? What success metrics?
2. Internal consistency: Do objectives conflict or create tradeoffs?
3. Ambition vs achievability: Over-scoped or under-scoped given resources?
4. Dependencies: Which objectives must be achieved first?
5. Hidden objectives: What unstated goals might be driving this?
6. Failure modes: What would "partial success" look like?

## WAYS (Methods and Approaches)
Evaluate:
1. Causal logic: Trace action-to-outcome chains, identify weak links
2. Alternatives: What major approaches are missing?
3. Integration: How do approaches interact and sequence?
4. Novelty vs orthodoxy: Innovation requirements vs proven methods
5. Adversary considerations: How might competitors disrupt approaches?
6. Resource intensity: Rank approaches by resource demands
7. Decision points: Where is flexibility preserved vs lost?

## MEANS (Resources and Capabilities)
Evaluate:
1. Sufficiency: Are means adequate for ends and ways?
2. Readiness: Immediate vs developmental timeline
3. Fungibility: Reallocation flexibility vs locked commitments
4. Dependencies: External dependencies and availability risks
5. Hidden costs: Second-order resource requirements
6. Capability gaps: Missing critical capabilities
7. Concentration risk: Over-dependence on single resources

## RISKS
Evaluate:
1. Completeness: Missing risk categories (execution, environmental, adversary, second-order)
2. Probability and impact: Appropriate weighting of risks
3. Interconnected risks: Cascading failures and common modes
4. Mitigation strategies: Contingency planning adequacy
5. Risk appetite: Appropriate risk tolerance level
6. Early warning indicators: Signals for risk materialization
7. Irreversible risks: Cannot-recover-from scenarios

## ASSUMPTIONS
Evaluate:
1. Explicitness: Critical embedded assumptions not stated
2. Testability: Can assumptions be validated with evidence?
3. Historical validity: Analogous situations and reference class forecasting
4. Fragility: Most likely assumptions to be violated
5. Dependencies: Foundational assumptions supporting others
6. Contradictions: Conflicts between assumptions
7. Environmental sensitivity: External change vulnerability
8. Monitoring: Processes to track assumption validity

## INTEGRATION
Evaluate:
1. Internal consistency: Component conflicts and contradictions
2. Critical path: Single most likely point of failure
3. Resource-constrained prioritization: 30% budget cut scenario
4. Theory of victory: Complete logical chain verification
5. Stress test: Three most severe adverse scenarios

Return ONLY valid JSON with this structure:
{
  "strategicObjective": "${input}",
  "ends": {
    "objectives": [
      {
        "objective": "Specific measurable objective",
        "specificity": "Evaluation of measurability and time bounds",
        "metrics": ["Success metric 1", "Success metric 2"],
        "timeframe": "6 months",
        "achievability": "appropriate"
      }
    ],
    "internalConsistency": "Analysis of objective conflicts and tradeoffs",
    "hiddenObjectives": ["Unstated goal 1", "Hidden motivation 2"],
    "failureModes": ["Partial success scenario 1", "Abandonment criteria"]
  },
  "ways": {
    "approaches": [
      {
        "approach": "Strategic approach description",
        "causalLogic": "Action-to-outcome causal chain",
        "executionRisk": "medium",
        "resourceIntensity": "high",
        "novelty": "innovative"
      }
    ],
    "alternatives": ["Alternative approach 1", "Alternative approach 2"],
    "integration": "How approaches interact and sequence",
    "adversaryConsiderations": ["Competitive disruption 1", "Countermove 2"]
  },
  "means": {
    "resources": [
      {
        "resource": "Required resource/capability",
        "sufficiency": "adequate",
        "readiness": "short-term",
        "fungibility": "medium",
        "dependencies": ["External dependency 1"]
      }
    ],
    "capabilityGaps": ["Missing capability 1", "Gap in skill 2"],
    "hiddenCosts": ["Training costs", "Maintenance requirements"],
    "concentrationRisks": ["Over-dependence on single vendor"]
  },
  "risks": {
    "riskFactors": [
      {
        "risk": "Specific risk description",
        "category": "execution",
        "probability": 30,
        "impact": "high",
        "mitigation": "Risk mitigation approach",
        "earlyWarning": ["Signal 1", "Indicator 2"]
      }
    ],
    "interconnectedRisks": ["Risk cascade 1", "Common failure mode"],
    "underestimatedRisk": "Most likely underestimated risk with reasoning"
  },
  "assumptions": {
    "criticalAssumptions": [
      {
        "assumption": "Critical assumption statement",
        "testability": "medium",
        "fragility": "moderate",
        "monitoring": ["Validation method 1", "Check mechanism 2"]
      }
    ],
    "contradictions": ["Assumption conflict 1", "Logic contradiction"],
    "vulnerabilities": "Greatest strategic vulnerability from assumptions"
  },
  "integration": {
    "criticalPath": "Single most likely point of failure across all components",
    "theoryOfVictory": "Complete logical chain: assumptions→means→ways→ends",
    "topVulnerabilities": ["Vulnerability 1", "Vulnerability 2", "Vulnerability 3"],
    "stressTestScenarios": ["Adverse scenario 1", "Stress test 2", "Challenge 3"]
  }
}

Develop a rigorous strategic framework with specific, actionable recommendations and clear measurement criteria.`
    }]
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
  console.log('Raw strategy response:', responseText)

  let jsonMatch = responseText.match(/\{[\s\S]*\}/)
  const jsonText = jsonMatch ? jsonMatch[0] : responseText

  try {
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('JSON parsing failed for strategy:', error)
    throw new Error('Invalid JSON response from Claude')
  }
}