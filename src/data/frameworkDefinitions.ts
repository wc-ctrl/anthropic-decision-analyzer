import { FrameworkDefinition } from '@/types/framework'

// Featured frameworks shown at the top of the picker
export const featuredFrameworkIds = ['buildVsBuy', 'swot', 'rice', 'businessModelCanvas']

export const frameworks: FrameworkDefinition[] = [
  // =============================================
  // DECISION FRAMEWORKS
  // Common decision-making tools
  // =============================================
  {
    id: 'buildVsBuy',
    name: 'Build vs. Buy',
    description: 'Evaluate whether to build in-house or purchase/license a solution',
    category: 'Decisions',
    fields: [
      { id: 'totalCost', label: 'Total Cost of Ownership', placeholder: 'Build costs vs. licensing, support, training...' },
      { id: 'timeToMarket', label: 'Time-to-Market', placeholder: 'Development timeline vs. deployment speed...' },
      { id: 'customization', label: 'Customization Needs', placeholder: 'Unique requirements, flexibility needed...' },
      { id: 'maintenance', label: 'Maintenance Burden', placeholder: 'Ongoing support, updates, team resources...' },
      { id: 'vendorRisk', label: 'Vendor/Lock-in Risk', placeholder: 'Dependency, vendor viability, exit costs...' },
      { id: 'integration', label: 'Integration Complexity', placeholder: 'APIs, data migration, system compatibility...' },
      { id: 'strategicAlignment', label: 'Strategic Alignment', placeholder: 'Core competency, competitive advantage...' },
      { id: 'teamCapability', label: 'Team Capability', placeholder: 'Skills available, hiring needs, ramp-up...' },
      { id: 'recommendation', label: 'Recommendation', placeholder: 'Build, buy, or hybrid with reasoning...' },
    ],
    layout: 'generic',
  },
  {
    id: 'rapid',
    name: 'RAPID Decision Making',
    description: 'Clarify decision-making roles and accountability',
    category: 'Decisions',
    fields: [
      { id: 'recommend', label: 'Recommend', placeholder: 'Who proposes the decision...' },
      { id: 'agree', label: 'Agree', placeholder: 'Who has veto power...' },
      { id: 'perform', label: 'Perform', placeholder: 'Who executes the decision...' },
      { id: 'input', label: 'Input', placeholder: 'Who provides information...' },
      { id: 'decide', label: 'Decide', placeholder: 'Who makes the final call...' },
    ],
    layout: 'generic',
  },
  {
    id: 'eisenhower',
    name: 'Eisenhower Matrix',
    description: 'Prioritize by urgency and importance',
    category: 'Decisions',
    fields: [
      { id: 'urgentImportant', label: 'Do First', placeholder: 'Urgent and important...' },
      { id: 'notUrgentImportant', label: 'Schedule', placeholder: 'Important but not urgent...' },
      { id: 'urgentNotImportant', label: 'Delegate', placeholder: 'Urgent but not important...' },
      { id: 'notUrgentNotImportant', label: 'Eliminate', placeholder: 'Neither urgent nor important...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'moscow',
    name: 'MoSCoW Prioritization',
    description: 'Prioritize requirements and features',
    category: 'Decisions',
    fields: [
      { id: 'must', label: 'Must Have', placeholder: 'Non-negotiable requirements...' },
      { id: 'should', label: 'Should Have', placeholder: 'Important but not vital...' },
      { id: 'could', label: 'Could Have', placeholder: 'Nice to have...' },
      { id: 'wont', label: "Won't Have (This Time)", placeholder: 'Explicitly excluded...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'rice',
    name: 'RICE Scoring Model',
    description: 'Score and rank initiatives by reach, impact, confidence, and effort',
    category: 'Decisions',
    fields: [
      { id: 'initiative', label: 'Initiative', placeholder: 'What you\'re evaluating...' },
      { id: 'reach', label: 'Reach', placeholder: 'People affected per quarter...' },
      { id: 'impact', label: 'Impact', placeholder: 'Effect on each person (1-3 scale)...' },
      { id: 'confidence', label: 'Confidence', placeholder: 'Certainty percentage...' },
      { id: 'effort', label: 'Effort', placeholder: 'Person-months required...' },
      { id: 'score', label: 'RICE Score & Decision', placeholder: 'Calculated score and recommendation...' },
    ],
    layout: 'generic',
  },

  // =============================================
  // STRATEGY & PLANNING
  // Big-picture strategic analysis
  // =============================================
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
    category: 'Strategy & Planning',
    fields: [
      { id: 'strengths', label: 'Strengths', placeholder: 'Internal advantages...' },
      { id: 'weaknesses', label: 'Weaknesses', placeholder: 'Internal disadvantages...' },
      { id: 'opportunities', label: 'Opportunities', placeholder: 'External favorable factors...' },
      { id: 'threats', label: 'Threats', placeholder: 'External unfavorable factors...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'tows',
    name: 'TOWS Matrix',
    description: 'Generate strategic options from SWOT analysis',
    category: 'Strategy & Planning',
    fields: [
      { id: 'so', label: 'SO Strategies', placeholder: 'Strengths + Opportunities...' },
      { id: 'wo', label: 'WO Strategies', placeholder: 'Weaknesses + Opportunities...' },
      { id: 'st', label: 'ST Strategies', placeholder: 'Strengths + Threats...' },
      { id: 'wt', label: 'WT Strategies', placeholder: 'Weaknesses + Threats...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'pestle',
    name: 'PESTLE Analysis',
    description: 'Analyze macro-environmental factors',
    category: 'Strategy & Planning',
    fields: [
      { id: 'political', label: 'Political', placeholder: 'Government policies, regulations...' },
      { id: 'economic', label: 'Economic', placeholder: 'Economic conditions, trends...' },
      { id: 'social', label: 'Social', placeholder: 'Demographics, cultural trends...' },
      { id: 'technological', label: 'Technological', placeholder: 'Tech innovations, R&D...' },
      { id: 'legal', label: 'Legal', placeholder: 'Laws, regulations, compliance...' },
      { id: 'environmental', label: 'Environmental', placeholder: 'Ecological factors, sustainability...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'scenarioPlanning',
    name: 'Scenario Planning',
    description: 'Explore multiple future scenarios and implications',
    category: 'Strategy & Planning',
    fields: [
      { id: 'keyUncertainties', label: 'Key Uncertainties', placeholder: 'Major unknowns...' },
      { id: 'scenario1', label: 'Optimistic Scenario', placeholder: 'Best case outcome...' },
      { id: 'scenario2', label: 'Pessimistic Scenario', placeholder: 'Worst case outcome...' },
      { id: 'scenario3', label: 'Most Likely Scenario', placeholder: 'Probable outcome...' },
      { id: 'implications', label: 'Strategic Implications', placeholder: 'What this means for strategy...' },
    ],
    layout: 'generic',
  },
  {
    id: 'strategyDiamond',
    name: 'Strategy Diamond',
    description: 'Define complete business strategy across five facets',
    category: 'Strategy & Planning',
    fields: [
      { id: 'arenas', label: 'Arenas', placeholder: 'Where will we be active?...' },
      { id: 'vehicles', label: 'Vehicles', placeholder: 'How will we get there?...' },
      { id: 'differentiators', label: 'Differentiators', placeholder: 'How will we win?...' },
      { id: 'staging', label: 'Staging', placeholder: 'Speed and sequence of moves...' },
      { id: 'economicLogic', label: 'Economic Logic', placeholder: 'How returns are obtained...' },
    ],
    layout: 'generic',
  },
  {
    id: 'blueOcean',
    name: 'Blue Ocean Strategy',
    description: 'Create uncontested market space',
    category: 'Strategy & Planning',
    fields: [
      { id: 'currentFactors', label: 'Current Industry Factors', placeholder: 'Existing competitive factors...' },
      { id: 'eliminate', label: 'Eliminate', placeholder: 'Factors to remove...' },
      { id: 'reduce', label: 'Reduce', placeholder: 'Factors to reduce below standard...' },
      { id: 'raise', label: 'Raise', placeholder: 'Factors to raise above standard...' },
      { id: 'create', label: 'Create', placeholder: 'New factors to introduce...' },
    ],
    layout: 'generic',
  },
  {
    id: 'diamondE',
    name: 'Diamond-E Framework',
    description: 'Assess strategic alignment across organizational elements',
    category: 'Strategy & Planning',
    fields: [
      { id: 'environment', label: 'Environment', placeholder: 'External factors...' },
      { id: 'resources', label: 'Resources', placeholder: 'Available assets...' },
      { id: 'management', label: 'Management Preferences', placeholder: 'Leadership style and goals...' },
      { id: 'organization', label: 'Organization', placeholder: 'Structure and capabilities...' },
      { id: 'strategy', label: 'Strategy', placeholder: 'Current strategic approach...' },
      { id: 'alignment', label: 'Alignment Assessment', placeholder: 'How well elements fit together...' },
    ],
    layout: 'grid-3x2',
  },

  // =============================================
  // MARKET & COMPETITION
  // Understanding your competitive landscape
  // =============================================
  {
    id: 'porter',
    name: "Porter's Five Forces",
    description: 'Analyze competitive forces in an industry',
    category: 'Market & Competition',
    fields: [
      { id: 'rivalry', label: 'Competitive Rivalry', placeholder: 'Intensity of competition...' },
      { id: 'newEntrants', label: 'Threat of New Entrants', placeholder: 'Barriers to entry...' },
      { id: 'substitutes', label: 'Threat of Substitutes', placeholder: 'Alternative products/services...' },
      { id: 'buyerPower', label: 'Bargaining Power of Buyers', placeholder: 'Customer influence...' },
      { id: 'supplierPower', label: 'Bargaining Power of Suppliers', placeholder: 'Supplier influence...' },
    ],
    layout: 'porter',
  },
  {
    id: 'threeCs',
    name: '3Cs Framework',
    description: 'Analyze Company, Customers, and Competitors',
    category: 'Market & Competition',
    fields: [
      { id: 'company', label: 'Company', placeholder: 'Internal strengths, resources...' },
      { id: 'customers', label: 'Customers', placeholder: 'Needs, preferences, segments...' },
      { id: 'competitors', label: 'Competitors', placeholder: 'Competitive landscape...' },
    ],
    layout: 'three-columns',
  },
  {
    id: 'porterGeneric',
    name: "Porter's Generic Strategies",
    description: 'Choose competitive positioning',
    category: 'Market & Competition',
    fields: [
      { id: 'costLeadership', label: 'Cost Leadership', placeholder: 'Lowest cost producer...' },
      { id: 'differentiation', label: 'Differentiation', placeholder: 'Unique product/service...' },
      { id: 'focusCost', label: 'Cost Focus', placeholder: 'Low cost in niche market...' },
      { id: 'focusDiff', label: 'Differentiation Focus', placeholder: 'Unique offering in niche...' },
      { id: 'recommendation', label: 'Recommended Strategy', placeholder: 'Best fit for this situation...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'porterDiamond',
    name: "Porter's Diamond Model",
    description: 'Analyze national competitive advantage',
    category: 'Market & Competition',
    fields: [
      { id: 'factorConditions', label: 'Factor Conditions', placeholder: 'Skilled labor, infrastructure...' },
      { id: 'demandConditions', label: 'Demand Conditions', placeholder: 'Nature of home market...' },
      { id: 'relatedIndustries', label: 'Related & Supporting Industries', placeholder: 'Supplier industries...' },
      { id: 'firmStrategy', label: 'Firm Strategy & Rivalry', placeholder: 'How companies are managed...' },
      { id: 'government', label: 'Government', placeholder: 'Government policies and influence...' },
      { id: 'chance', label: 'Chance', placeholder: 'Random events and disruptions...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'competitorProfile',
    name: 'Competitor Profile',
    description: 'Deep-dive competitor analysis',
    category: 'Market & Competition',
    fields: [
      { id: 'competitor', label: 'Competitor', placeholder: 'Competitor name...' },
      { id: 'strategy', label: 'Current Strategy', placeholder: 'Their strategic approach...' },
      { id: 'capabilities', label: 'Key Capabilities', placeholder: 'Core strengths...' },
      { id: 'assumptions', label: 'Their Assumptions', placeholder: 'What they believe about the market...' },
      { id: 'futureGoals', label: 'Future Goals', placeholder: 'Where they want to go...' },
      { id: 'responseProfile', label: 'Response Profile', placeholder: 'How they\'ll react to our moves...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'stakeholder',
    name: 'Stakeholder Analysis',
    description: 'Map stakeholders by power and interest',
    category: 'Market & Competition',
    fields: [
      { id: 'highPowerHighInterest', label: 'Manage Closely', placeholder: 'High power, high interest...' },
      { id: 'highPowerLowInterest', label: 'Keep Satisfied', placeholder: 'High power, low interest...' },
      { id: 'lowPowerHighInterest', label: 'Keep Informed', placeholder: 'Low power, high interest...' },
      { id: 'lowPowerLowInterest', label: 'Monitor', placeholder: 'Low power, low interest...' },
    ],
    layout: 'grid-2x2',
  },

  // =============================================
  // BUSINESS & PRODUCT
  // Business models, products, and growth
  // =============================================
  {
    id: 'businessModelCanvas',
    name: 'Business Model Canvas',
    description: 'Describe, design, and analyze business models',
    category: 'Business & Product',
    fields: [
      { id: 'keyPartners', label: 'Key Partners', placeholder: 'Strategic alliances...' },
      { id: 'keyActivities', label: 'Key Activities', placeholder: 'Critical actions...' },
      { id: 'keyResources', label: 'Key Resources', placeholder: 'Essential assets...' },
      { id: 'valueProposition', label: 'Value Proposition', placeholder: 'Customer value delivered...' },
      { id: 'customerRelationships', label: 'Customer Relationships', placeholder: 'Relationship types...' },
      { id: 'channels', label: 'Channels', placeholder: 'Delivery methods...' },
      { id: 'customerSegments', label: 'Customer Segments', placeholder: 'Target customers...' },
      { id: 'costStructure', label: 'Cost Structure', placeholder: 'Major costs...' },
      { id: 'revenueStreams', label: 'Revenue Streams', placeholder: 'Income sources...' },
    ],
    layout: 'canvas',
  },
  {
    id: 'leanCanvas',
    name: 'Lean Canvas',
    description: 'One-page business plan for startups',
    category: 'Business & Product',
    fields: [
      { id: 'problem', label: 'Problem', placeholder: 'Top 3 problems...' },
      { id: 'solution', label: 'Solution', placeholder: 'Top 3 features...' },
      { id: 'uniqueValue', label: 'Unique Value Proposition', placeholder: 'What makes you different...' },
      { id: 'unfairAdvantage', label: 'Unfair Advantage', placeholder: 'What can\'t be copied...' },
      { id: 'customerSegments', label: 'Customer Segments', placeholder: 'Target customers...' },
      { id: 'keyMetrics', label: 'Key Metrics', placeholder: 'Numbers that matter...' },
      { id: 'channels', label: 'Channels', placeholder: 'Path to customers...' },
      { id: 'costStructure', label: 'Cost Structure', placeholder: 'Fixed and variable costs...' },
      { id: 'revenueStreams', label: 'Revenue Streams', placeholder: 'Revenue model...' },
    ],
    layout: 'canvas',
  },
  {
    id: 'valuePropositionCanvas',
    name: 'Value Proposition Canvas',
    description: 'Align products with customer needs',
    category: 'Business & Product',
    fields: [
      { id: 'customerJobs', label: 'Customer Jobs', placeholder: 'Tasks to accomplish...' },
      { id: 'pains', label: 'Pains', placeholder: 'Frustrations, obstacles...' },
      { id: 'gains', label: 'Gains', placeholder: 'Benefits and desires...' },
      { id: 'products', label: 'Products & Services', placeholder: 'What you offer...' },
      { id: 'painRelievers', label: 'Pain Relievers', placeholder: 'How you alleviate pains...' },
      { id: 'gainCreators', label: 'Gain Creators', placeholder: 'How you create gains...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'ansoff',
    name: 'Ansoff Matrix',
    description: 'Strategic growth options across products and markets',
    category: 'Business & Product',
    fields: [
      { id: 'marketPenetration', label: 'Market Penetration', placeholder: 'Existing products, existing markets...' },
      { id: 'productDevelopment', label: 'Product Development', placeholder: 'New products, existing markets...' },
      { id: 'marketDevelopment', label: 'Market Development', placeholder: 'Existing products, new markets...' },
      { id: 'diversification', label: 'Diversification', placeholder: 'New products, new markets...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'threeHorizons',
    name: 'McKinsey Three Horizons',
    description: 'Balance current and future growth',
    category: 'Business & Product',
    fields: [
      { id: 'horizon1', label: 'Horizon 1: Maintain & Defend', placeholder: 'Core business optimization...' },
      { id: 'horizon2', label: 'Horizon 2: Nurture & Build', placeholder: 'Emerging opportunities...' },
      { id: 'horizon3', label: 'Horizon 3: Create Options', placeholder: 'Future R&D and bets...' },
      { id: 'resourceAllocation', label: 'Resource Allocation', placeholder: 'How to distribute resources...' },
    ],
    layout: 'generic',
  },
  {
    id: 'sevenDegrees',
    name: '7 Degrees of Freedom',
    description: 'Explore growth vectors across seven dimensions',
    category: 'Business & Product',
    fields: [
      { id: 'existingProducts', label: 'Existing Products', placeholder: 'Grow current products...' },
      { id: 'newProducts', label: 'New Products', placeholder: 'Develop new products...' },
      { id: 'newServices', label: 'New Services', placeholder: 'Add service offerings...' },
      { id: 'newDelivery', label: 'New Delivery Models', placeholder: 'Innovate delivery...' },
      { id: 'newCustomers', label: 'New Customers', placeholder: 'Reach new segments...' },
      { id: 'newGeographies', label: 'New Geographies', placeholder: 'Expand geographically...' },
      { id: 'newIndustry', label: 'New Industry Structure', placeholder: 'Reshape the industry...' },
    ],
    layout: 'generic',
  },
  {
    id: 'bcg',
    name: 'BCG Growth-Share Matrix',
    description: 'Portfolio analysis for business units or products',
    category: 'Business & Product',
    fields: [
      { id: 'stars', label: 'Stars (High Growth, High Share)', placeholder: 'Products/units to invest in...' },
      { id: 'cashCows', label: 'Cash Cows (Low Growth, High Share)', placeholder: 'Profitable, mature products...' },
      { id: 'questionMarks', label: 'Question Marks (High Growth, Low Share)', placeholder: 'Uncertain potential...' },
      { id: 'dogs', label: 'Dogs (Low Growth, Low Share)', placeholder: 'Consider divesting...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'geMcKinsey',
    name: 'GE-McKinsey Matrix',
    description: '9-box matrix for portfolio investment decisions',
    category: 'Business & Product',
    fields: [
      { id: 'investGrow', label: 'Invest/Grow', placeholder: 'High attractiveness, high strength...' },
      { id: 'selectiveInvest', label: 'Selective Investment', placeholder: 'Medium-high positioning...' },
      { id: 'selectivity', label: 'Selectivity/Earnings', placeholder: 'Medium positioning...' },
      { id: 'harvestDivest', label: 'Harvest/Divest', placeholder: 'Low positioning...' },
      { id: 'industryAttractiveness', label: 'Industry Attractiveness', placeholder: 'Market size, growth rate...' },
      { id: 'competitiveStrength', label: 'Competitive Strength', placeholder: 'Market share, brand strength...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'profitability',
    name: 'Profitability Framework',
    description: 'Diagnose profit issues through revenue and costs',
    category: 'Business & Product',
    fields: [
      { id: 'revenue', label: 'Revenue', placeholder: 'Price x Quantity breakdown...' },
      { id: 'price', label: 'Price', placeholder: 'Pricing power, competition...' },
      { id: 'quantity', label: 'Quantity', placeholder: 'Volume drivers, market size...' },
      { id: 'fixedCosts', label: 'Fixed Costs', placeholder: 'Rent, salaries, depreciation...' },
      { id: 'variableCosts', label: 'Variable Costs', placeholder: 'Materials, labor, shipping...' },
      { id: 'recommendations', label: 'Recommendations', placeholder: 'Actions to improve profitability...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'fourPs',
    name: '4Ps Marketing Mix',
    description: 'Analyze marketing strategy elements',
    category: 'Business & Product',
    fields: [
      { id: 'product', label: 'Product', placeholder: 'Features, quality, branding...' },
      { id: 'price', label: 'Price', placeholder: 'Pricing strategy, discounts...' },
      { id: 'place', label: 'Place', placeholder: 'Distribution channels...' },
      { id: 'promotion', label: 'Promotion', placeholder: 'Advertising, PR, sales...' },
    ],
    layout: 'grid-2x2',
  },

  // =============================================
  // CUSTOMER & PRODUCT DEVELOPMENT
  // Understanding customers and building products
  // =============================================
  {
    id: 'customerJourney',
    name: 'Customer Journey Map',
    description: 'Map customer experience across touchpoints',
    category: 'Customer & Product',
    fields: [
      { id: 'awareness', label: 'Awareness', placeholder: 'How customers discover you...' },
      { id: 'consideration', label: 'Consideration', placeholder: 'Evaluation process...' },
      { id: 'purchase', label: 'Purchase', placeholder: 'Buying experience...' },
      { id: 'retention', label: 'Retention', placeholder: 'Ongoing engagement...' },
      { id: 'advocacy', label: 'Advocacy', placeholder: 'Referral and promotion...' },
      { id: 'painPoints', label: 'Key Pain Points', placeholder: 'Friction across journey...' },
    ],
    layout: 'generic',
  },
  {
    id: 'empathyMap',
    name: 'Empathy Map',
    description: 'Understand customer perspective deeply',
    category: 'Customer & Product',
    fields: [
      { id: 'thinks', label: 'Thinks & Feels', placeholder: 'Inner thoughts and emotions...' },
      { id: 'sees', label: 'Sees', placeholder: 'Environment, visual inputs...' },
      { id: 'says', label: 'Says & Does', placeholder: 'Observable behavior...' },
      { id: 'hears', label: 'Hears', placeholder: 'Influences, what others say...' },
      { id: 'pains', label: 'Pains', placeholder: 'Fears, frustrations...' },
      { id: 'gains', label: 'Gains', placeholder: 'Wants, needs, measures of success...' },
    ],
    layout: 'grid-3x2',
  },
  {
    id: 'jobsToBeDone',
    name: 'Jobs To Be Done',
    description: 'Understand why customers hire products',
    category: 'Customer & Product',
    fields: [
      { id: 'functionalJobs', label: 'Functional Jobs', placeholder: 'Practical tasks...' },
      { id: 'emotionalJobs', label: 'Emotional Jobs', placeholder: 'How they want to feel...' },
      { id: 'socialJobs', label: 'Social Jobs', placeholder: 'How they want to be perceived...' },
      { id: 'currentSolutions', label: 'Current Solutions', placeholder: 'What they use today...' },
      { id: 'desiredOutcomes', label: 'Desired Outcomes', placeholder: 'What success looks like...' },
    ],
    layout: 'generic',
  },
  {
    id: 'kano',
    name: 'Kano Model',
    description: 'Prioritize features by customer satisfaction impact',
    category: 'Customer & Product',
    fields: [
      { id: 'must', label: 'Must-Be (Basic)', placeholder: 'Expected features...' },
      { id: 'performance', label: 'Performance (Linear)', placeholder: 'More is better features...' },
      { id: 'attractive', label: 'Attractive (Delighters)', placeholder: 'Unexpected exciting features...' },
      { id: 'indifferent', label: 'Indifferent', placeholder: 'Features customers don\'t care about...' },
      { id: 'reverse', label: 'Reverse', placeholder: 'Features some customers dislike...' },
    ],
    layout: 'generic',
  },
  {
    id: 'productLifecycle',
    name: 'Product Life Cycle',
    description: 'Manage products through introduction, growth, maturity, and decline',
    category: 'Customer & Product',
    fields: [
      { id: 'introduction', label: 'Introduction', placeholder: 'Launch strategy...' },
      { id: 'growth', label: 'Growth', placeholder: 'Scaling approach...' },
      { id: 'maturity', label: 'Maturity', placeholder: 'Defending market share...' },
      { id: 'decline', label: 'Decline', placeholder: 'Harvest, divest, or revitalize...' },
      { id: 'currentStage', label: 'Current Stage & Actions', placeholder: 'Where the product is now...' },
    ],
    layout: 'generic',
  },
  {
    id: 'nps',
    name: 'Net Promoter Score Analysis',
    description: 'Measure and improve customer loyalty',
    category: 'Customer & Product',
    fields: [
      { id: 'promoters', label: 'Promoters (9-10)', placeholder: 'Loyal enthusiasts...' },
      { id: 'passives', label: 'Passives (7-8)', placeholder: 'Satisfied but unenthusiastic...' },
      { id: 'detractors', label: 'Detractors (0-6)', placeholder: 'Unhappy customers...' },
      { id: 'drivers', label: 'Key Drivers', placeholder: 'What drives each segment...' },
      { id: 'actions', label: 'Improvement Actions', placeholder: 'How to move the needle...' },
    ],
    layout: 'generic',
  },

  // =============================================
  // ORGANIZATION & OPERATIONS
  // Internal alignment, processes, and people
  // =============================================
  {
    id: 'mckinsey7s',
    name: 'McKinsey 7S Framework',
    description: 'Analyze organizational alignment across 7 elements',
    category: 'Organization & Ops',
    fields: [
      { id: 'strategy', label: 'Strategy', placeholder: 'Plan for competitive advantage...' },
      { id: 'structure', label: 'Structure', placeholder: 'Organizational hierarchy...' },
      { id: 'systems', label: 'Systems', placeholder: 'Daily processes and procedures...' },
      { id: 'sharedValues', label: 'Shared Values', placeholder: 'Core values and culture...' },
      { id: 'style', label: 'Style', placeholder: 'Leadership approach...' },
      { id: 'staff', label: 'Staff', placeholder: 'Employee capabilities...' },
      { id: 'skills', label: 'Skills', placeholder: 'Core competencies...' },
    ],
    layout: 'seven-s',
  },
  {
    id: 'valueChain',
    name: 'Value Chain Analysis',
    description: 'Analyze primary and support activities for competitive advantage',
    category: 'Organization & Ops',
    fields: [
      { id: 'inboundLogistics', label: 'Inbound Logistics', placeholder: 'Receiving, warehousing...' },
      { id: 'operations', label: 'Operations', placeholder: 'Production processes...' },
      { id: 'outboundLogistics', label: 'Outbound Logistics', placeholder: 'Distribution, delivery...' },
      { id: 'marketing', label: 'Marketing & Sales', placeholder: 'Promotion, selling...' },
      { id: 'service', label: 'Service', placeholder: 'Post-sale support...' },
      { id: 'infrastructure', label: 'Firm Infrastructure', placeholder: 'Management, finance, legal...' },
      { id: 'hrm', label: 'Human Resource Management', placeholder: 'Recruiting, training...' },
      { id: 'technology', label: 'Technology Development', placeholder: 'R&D, IT systems...' },
      { id: 'procurement', label: 'Procurement', placeholder: 'Purchasing inputs...' },
    ],
    layout: 'value-chain',
  },
  {
    id: 'raci',
    name: 'RACI Matrix',
    description: 'Clarify roles and responsibilities',
    category: 'Organization & Ops',
    fields: [
      { id: 'tasks', label: 'Key Tasks/Decisions', placeholder: 'Major tasks to assign...' },
      { id: 'responsible', label: 'Responsible (R)', placeholder: 'Who does the work...' },
      { id: 'accountable', label: 'Accountable (A)', placeholder: 'Final decision authority...' },
      { id: 'consulted', label: 'Consulted (C)', placeholder: 'Who provides input...' },
      { id: 'informed', label: 'Informed (I)', placeholder: 'Who needs to know...' },
    ],
    layout: 'generic',
  },
  {
    id: 'balancedScorecard',
    name: 'Balanced Scorecard',
    description: 'Measure performance across four perspectives',
    category: 'Organization & Ops',
    fields: [
      { id: 'financial', label: 'Financial', placeholder: 'Revenue, profitability, ROI...' },
      { id: 'customer', label: 'Customer', placeholder: 'Satisfaction, retention, market share...' },
      { id: 'internalProcess', label: 'Internal Process', placeholder: 'Quality, efficiency, innovation...' },
      { id: 'learningGrowth', label: 'Learning & Growth', placeholder: 'Training, culture, knowledge...' },
    ],
    layout: 'grid-2x2',
  },
  {
    id: 'okr',
    name: 'OKR Framework',
    description: 'Set objectives and measurable key results',
    category: 'Organization & Ops',
    fields: [
      { id: 'objective1', label: 'Objective 1', placeholder: 'Primary goal...' },
      { id: 'kr1a', label: 'Key Result 1.1', placeholder: 'Measurable outcome...' },
      { id: 'kr1b', label: 'Key Result 1.2', placeholder: 'Measurable outcome...' },
      { id: 'kr1c', label: 'Key Result 1.3', placeholder: 'Measurable outcome...' },
      { id: 'objective2', label: 'Objective 2', placeholder: 'Secondary goal...' },
      { id: 'kr2a', label: 'Key Result 2.1', placeholder: 'Measurable outcome...' },
      { id: 'kr2b', label: 'Key Result 2.2', placeholder: 'Measurable outcome...' },
      { id: 'kr2c', label: 'Key Result 2.3', placeholder: 'Measurable outcome...' },
    ],
    layout: 'generic',
  },
  {
    id: 'gapAnalysis',
    name: 'Gap Analysis',
    description: 'Compare current state to desired state and plan the bridge',
    category: 'Organization & Ops',
    fields: [
      { id: 'currentState', label: 'Current State', placeholder: 'Where we are now...' },
      { id: 'desiredState', label: 'Desired State', placeholder: 'Where we want to be...' },
      { id: 'gaps', label: 'Identified Gaps', placeholder: 'What\'s missing...' },
      { id: 'actions', label: 'Action Plan', placeholder: 'Steps to close gaps...' },
    ],
    layout: 'gap',
  },
  {
    id: 'sixSigma',
    name: 'Six Sigma DMAIC',
    description: 'Improve processes systematically: Define, Measure, Analyze, Improve, Control',
    category: 'Organization & Ops',
    fields: [
      { id: 'define', label: 'Define', placeholder: 'Problem statement, scope, goals...' },
      { id: 'measure', label: 'Measure', placeholder: 'Current performance, data collection...' },
      { id: 'analyze', label: 'Analyze', placeholder: 'Root causes, data analysis...' },
      { id: 'improve', label: 'Improve', placeholder: 'Solutions, implementation plan...' },
      { id: 'control', label: 'Control', placeholder: 'Sustaining improvements, monitoring...' },
    ],
    layout: 'generic',
  },
  {
    id: 'vrio',
    name: 'VRIO Framework',
    description: 'Evaluate resources for sustainable competitive advantage',
    category: 'Organization & Ops',
    fields: [
      { id: 'resource', label: 'Resource/Capability', placeholder: 'Resource being analyzed...' },
      { id: 'valuable', label: 'Valuable', placeholder: 'Provides value to customers?...' },
      { id: 'rare', label: 'Rare', placeholder: 'Scarce among competitors?...' },
      { id: 'imitable', label: 'Costly to Imitate', placeholder: 'Difficult to replicate?...' },
      { id: 'organized', label: 'Organized to Capture Value', placeholder: 'Systems to exploit?...' },
    ],
    layout: 'generic',
  },
  {
    id: 'coreCompetence',
    name: 'Core Competence Analysis',
    description: 'Identify capabilities that are strategic advantages',
    category: 'Organization & Ops',
    fields: [
      { id: 'competence', label: 'Potential Competence', placeholder: 'Capability being evaluated...' },
      { id: 'customerValue', label: 'Customer Value', placeholder: 'Significant customer benefit?...' },
      { id: 'competitorDiff', label: 'Competitor Differentiation', placeholder: 'Unique vs competitors?...' },
      { id: 'extendability', label: 'Extendability', placeholder: 'Leverage across products/markets?...' },
      { id: 'strategicImplications', label: 'Strategic Implications', placeholder: 'Assessment and next steps...' },
    ],
    layout: 'generic',
  },

  // =============================================
  // PROBLEM SOLVING
  // Root cause analysis and structured thinking
  // =============================================
  {
    id: 'mece',
    name: 'MECE Issue Tree',
    description: 'Structure problems into mutually exclusive, collectively exhaustive categories',
    category: 'Problem Solving',
    fields: [
      { id: 'problem', label: 'Core Problem', placeholder: 'Problem statement...' },
      { id: 'branch1', label: 'Branch 1', placeholder: 'First major category...' },
      { id: 'branch2', label: 'Branch 2', placeholder: 'Second major category...' },
      { id: 'branch3', label: 'Branch 3', placeholder: 'Third major category...' },
      { id: 'branch4', label: 'Branch 4', placeholder: 'Fourth major category...' },
    ],
    layout: 'generic',
  },
  {
    id: 'fiveWhys',
    name: 'Root Cause Analysis (5 Whys)',
    description: 'Drill down through five layers to find root causes',
    category: 'Problem Solving',
    fields: [
      { id: 'problem', label: 'Problem Statement', placeholder: 'What is happening?...' },
      { id: 'why1', label: 'Why? (1st)', placeholder: 'First level cause...' },
      { id: 'why2', label: 'Why? (2nd)', placeholder: 'Second level cause...' },
      { id: 'why3', label: 'Why? (3rd)', placeholder: 'Third level cause...' },
      { id: 'why4', label: 'Why? (4th)', placeholder: 'Fourth level cause...' },
      { id: 'why5', label: 'Why? (5th)', placeholder: 'Fifth level cause...' },
      { id: 'rootCause', label: 'Root Cause Summary', placeholder: 'Fundamental cause...' },
      { id: 'solution', label: 'Proposed Solution', placeholder: 'How to address root cause...' },
    ],
    layout: 'five-whys',
  },
  {
    id: 'fishbone',
    name: 'Fishbone Diagram (Ishikawa)',
    description: 'Identify causes of problems across six categories',
    category: 'Problem Solving',
    fields: [
      { id: 'problem', label: 'Effect/Problem', placeholder: 'Problem to analyze...' },
      { id: 'people', label: 'People', placeholder: 'Human factors...' },
      { id: 'process', label: 'Process', placeholder: 'Process issues...' },
      { id: 'equipment', label: 'Equipment', placeholder: 'Tools and machinery...' },
      { id: 'materials', label: 'Materials', placeholder: 'Raw materials, inputs...' },
      { id: 'environment', label: 'Environment', placeholder: 'Working conditions...' },
      { id: 'management', label: 'Management', placeholder: 'Leadership, policies...' },
    ],
    layout: 'generic',
  },
  {
    id: 'paretoAnalysis',
    name: 'Pareto Analysis (80/20)',
    description: 'Focus on the vital few causes that drive most impact',
    category: 'Problem Solving',
    fields: [
      { id: 'problem', label: 'Problem Area', placeholder: 'Area to analyze...' },
      { id: 'causes', label: 'All Contributing Factors', placeholder: 'List all causes...' },
      { id: 'vitalFew', label: 'Vital Few (20%)', placeholder: 'Top causes driving 80% of impact...' },
      { id: 'actions', label: 'Priority Actions', placeholder: 'Actions for vital few...' },
    ],
    layout: 'generic',
  },
  {
    id: 'forceField',
    name: 'Force Field Analysis',
    description: 'Analyze forces for and against change',
    category: 'Problem Solving',
    fields: [
      { id: 'goal', label: 'Change Goal', placeholder: 'What you want to achieve...' },
      { id: 'drivingForces', label: 'Driving Forces', placeholder: 'Forces pushing for change...' },
      { id: 'restrainingForces', label: 'Restraining Forces', placeholder: 'Forces resisting change...' },
      { id: 'strategies', label: 'Strategies', placeholder: 'Strengthen drivers, weaken restrainers...' },
    ],
    layout: 'grid-2x2',
  },

  // =============================================
  // CHANGE MANAGEMENT
  // Leading and managing organizational change
  // =============================================
  {
    id: 'adkar',
    name: 'ADKAR Change Model',
    description: 'Guide individual change: Awareness, Desire, Knowledge, Ability, Reinforcement',
    category: 'Change Management',
    fields: [
      { id: 'awareness', label: 'Awareness', placeholder: 'Why is change needed?...' },
      { id: 'desire', label: 'Desire', placeholder: 'Motivation to support change...' },
      { id: 'knowledge', label: 'Knowledge', placeholder: 'How to change, skills needed...' },
      { id: 'ability', label: 'Ability', placeholder: 'Implementing required skills...' },
      { id: 'reinforcement', label: 'Reinforcement', placeholder: 'Sustaining the change...' },
    ],
    layout: 'generic',
  },
  {
    id: 'kotterChange',
    name: "Kotter's 8-Step Change",
    description: 'Lead organizational transformation through eight steps',
    category: 'Change Management',
    fields: [
      { id: 'urgency', label: '1. Create Urgency', placeholder: 'Why change now...' },
      { id: 'coalition', label: '2. Build Coalition', placeholder: 'Key change leaders...' },
      { id: 'vision', label: '3. Form Vision', placeholder: 'What the future looks like...' },
      { id: 'communicate', label: '4. Communicate Vision', placeholder: 'Spreading the message...' },
      { id: 'empower', label: '5. Empower Action', placeholder: 'Removing barriers...' },
      { id: 'wins', label: '6. Create Quick Wins', placeholder: 'Early visible successes...' },
      { id: 'build', label: '7. Build on Change', placeholder: 'Consolidating gains...' },
      { id: 'anchor', label: '8. Anchor in Culture', placeholder: 'Making it stick...' },
    ],
    layout: 'generic',
  },
  {
    id: 'lewinChange',
    name: "Lewin's Change Model",
    description: 'Unfreeze-Change-Refreeze framework for transitions',
    category: 'Change Management',
    fields: [
      { id: 'currentState', label: 'Current State', placeholder: 'Status quo...' },
      { id: 'unfreeze', label: 'Unfreeze', placeholder: 'Creating readiness for change...' },
      { id: 'change', label: 'Change', placeholder: 'Implementing the transition...' },
      { id: 'refreeze', label: 'Refreeze', placeholder: 'Stabilizing the new state...' },
    ],
    layout: 'grid-2x2',
  },
]

// Helper: get unique categories in order of first appearance
export function getCategories(): string[] {
  const seen = new Set<string>()
  const categories: string[] = []
  for (const fw of frameworks) {
    if (!seen.has(fw.category)) {
      seen.add(fw.category)
      categories.push(fw.category)
    }
  }
  return categories
}

// Helper: get frameworks by category
export function getFrameworksByCategory(): Record<string, FrameworkDefinition[]> {
  const grouped: Record<string, FrameworkDefinition[]> = {}
  for (const fw of frameworks) {
    if (!grouped[fw.category]) {
      grouped[fw.category] = []
    }
    grouped[fw.category].push(fw)
  }
  return grouped
}

// Helper: find a framework by ID
export function getFrameworkById(id: string): FrameworkDefinition | undefined {
  return frameworks.find(fw => fw.id === id)
}

// Helper: get featured frameworks
export function getFeaturedFrameworks(): FrameworkDefinition[] {
  return featuredFrameworkIds
    .map(id => frameworks.find(fw => fw.id === id))
    .filter((fw): fw is FrameworkDefinition => fw !== undefined)
}
